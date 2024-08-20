import { Inject, Injectable, Type } from '@nestjs/common';
import {
  Brackets,
  DataSource,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';

import { unique, UserInputError, LogicalOperator } from '@mosaic/common';

import { MosaicEntity } from '../../../data/entity';
import { DATA_SOURCE_PROVIDER } from '../../../data';
import {
  FilterParameter,
  ListQueryOptions,
  NullOptionals,
} from '../../../types';
import { joinTreeRelationsDynamically } from '../utils';
import { RequestContext } from '../../../api';
import { parseFilterParams, WhereGroup } from './parse-filter-params';
import { getEntityAlias } from './connection-utils';
import { getCalculatedColumns } from './get-calculated-columns';
import { parseSortParams } from './parse-sort-params';

export type ExtendedListQueryOptions<T extends MosaicEntity> = {
  relations?: string[];
  where?: FindOptionsWhere<T>;
  orderBy?: FindOneOptions<T>['order'];
  entityAlias?: string;
  ctx?: RequestContext;
  customPropertyMap?: { [name: string]: string };
  ignoreQueryLimits?: boolean;
};

@Injectable()
export class ListQueryBuilder {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}

  public build<T extends MosaicEntity>(
    entity: Type<T>,
    options: ListQueryOptions<T> = {},
    extendedOptions: ExtendedListQueryOptions<T> = {}
  ): SelectQueryBuilder<T> {
    //const apiType = extendedOptions.ctx?.apiType ?? 'shop';
    const { take, skip } = this.parseTakeSkipParams(
      //apiType,
      options,
      extendedOptions.ignoreQueryLimits
    );

    const repo = this.dataSource.getRepository(entity);
    const alias = extendedOptions.entityAlias || entity.name.toLowerCase();
    const minimumRequiredRelations = this.getMinimumRequiredRelations(
      repo,
      options,
      extendedOptions
    );
    const qb = repo.createQueryBuilder(alias);

    let relations = unique([
      ...minimumRequiredRelations,
      ...(extendedOptions?.relations ?? []),
    ]);

    const processedRelations = joinTreeRelationsDynamically(
      qb,
      entity,
      relations
    );

    relations = relations.filter(
      (relationPath) => !processedRelations.has(relationPath)
    );

    qb.setFindOptions({
      relations,
      take,
      skip,
      where: extendedOptions.where || {},
      relationLoadStrategy: 'query',
    });

    // join the tables required by calculated columns
    this.joinCalculatedColumnRelations(qb, entity, options);

    const { customPropertyMap } = extendedOptions;
    if (customPropertyMap) {
      this.normalizeCustomPropertyMap(customPropertyMap, options, qb);
    }
    // const customFieldsForType =
    //   this.configService.customFields[entity.name as keyof CustomFields];
    const sortParams = Object.assign({}, options.sort, extendedOptions.orderBy);

    // this.applyTranslationConditions(
    //   qb,
    //   entity,
    //   sortParams,
    //   extendedOptions.ctx
    // );

    const sort = parseSortParams(
      qb.connection,
      entity,
      sortParams,
      customPropertyMap,
      qb.alias,
      [] //customFieldsForType
    );
    const filter = parseFilterParams(
      qb.connection,
      entity,
      options.filter,
      customPropertyMap,
      qb.alias
    );

    if (filter.length) {
      const filterOperator = options.filterOperator ?? LogicalOperator.AND;
      qb.andWhere(
        new Brackets((qb1) => {
          for (const condition of filter) {
            if ('conditions' in condition) {
              this.addNestedWhereClause(qb1, condition, filterOperator);
            } else {
              if (filterOperator === LogicalOperator.AND) {
                qb1.andWhere(condition.clause, condition.parameters);
              } else {
                qb1.orWhere(condition.clause, condition.parameters);
              }
            }
          }
        })
      );
    }

    qb.orderBy(sort);

    return qb;
  }

  private addNestedWhereClause(
    qb: WhereExpressionBuilder,
    whereGroup: WhereGroup,
    parentOperator: LogicalOperator
  ) {
    if (whereGroup.conditions.length) {
      const subQb = new Brackets((qb1) => {
        whereGroup.conditions.forEach((condition) => {
          if ('conditions' in condition) {
            this.addNestedWhereClause(qb1, condition, whereGroup.operator);
          } else {
            if (whereGroup.operator === LogicalOperator.AND) {
              qb1.andWhere(condition.clause, condition.parameters);
            } else {
              qb1.orWhere(condition.clause, condition.parameters);
            }
          }
        });
      });
      if (parentOperator === LogicalOperator.AND) {
        qb.andWhere(subQb);
      } else {
        qb.orWhere(subQb);
      }
    }
  }

  private parseTakeSkipParams(
    //apiType: ApiType,
    options: ListQueryOptions<any>,
    ignoreQueryLimits = false
  ): { take: number; skip: number } {
    // const { shopListQueryLimit, adminListQueryLimit } =
    //   this.configService.apiOptions;
    // const takeLimit = ignoreQueryLimits
    //   ? Number.MAX_SAFE_INTEGER
    //   : apiType === 'admin'
    //   ? adminListQueryLimit
    //   : shopListQueryLimit;

    const takeLimit = ignoreQueryLimits ? Number.MAX_SAFE_INTEGER : 20;

    if (options.take && options.take > takeLimit) {
      throw new UserInputError('error.list-query-limit-exceeded', {
        limit: takeLimit,
      });
    }

    const skip = Math.max(options.skip ?? 0, 0);
    // `take` must not be negative, and must not be greater than takeLimit
    let take =
      options.take == null
        ? takeLimit
        : Math.min(Math.max(options.take, 0), takeLimit);
    if (options.skip !== undefined && options.take === undefined) {
      take = takeLimit;
    }
    return { take, skip };
  }

  /**
   * @description
   * As part of list optimization, we only join the minimum required relations which are needed to
   * get the base list query. Other relations are then joined individually in the patched `getManyAndCount()`
   * method.
   */
  private getMinimumRequiredRelations<T extends MosaicEntity>(
    repository: Repository<T>,
    options: ListQueryOptions<T>,
    extendedOptions: ExtendedListQueryOptions<T>
  ): string[] {
    const requiredRelations: string[] = [];
    // if (extendedOptions.channelId) {
    //   requiredRelations.push('channels');
    // }

    if (extendedOptions.customPropertyMap) {
      const metadata = repository.metadata;

      for (const [property, path] of Object.entries(
        extendedOptions.customPropertyMap
      )) {
        if (!this.customPropertyIsBeingUsed(property, options)) {
          // If the custom property is not being used to filter or sort, then we don't need
          // to join the associated relations.
          continue;
        }
        const relationPath = path.split('.').slice(0, -1);
        let targetMetadata = metadata;
        const recontructedPath = [];
        for (const relationPathPart of relationPath) {
          const relationMetadata =
            targetMetadata.findRelationWithPropertyPath(relationPathPart);
          if (relationMetadata) {
            recontructedPath.push(relationMetadata.propertyName);
            requiredRelations.push(recontructedPath.join('.'));
            targetMetadata = relationMetadata.inverseEntityMetadata;
          }
        }
      }
    }
    return unique(requiredRelations);
  }

  private customPropertyIsBeingUsed(
    property: string,
    options: ListQueryOptions<any>
  ): boolean {
    return !!(
      options.sort?.[property] ||
      this.isPropertyUsedInFilter(property, options.filter)
    );
  }

  private isPropertyUsedInFilter(
    property: string,
    filter?: NullOptionals<FilterParameter<any>> | null
  ): boolean {
    return !!(
      filter &&
      (filter[property] ||
        filter._and?.some((nestedFilter) =>
          this.isPropertyUsedInFilter(property, nestedFilter)
        ) ||
        filter._or?.some((nestedFilter) =>
          this.isPropertyUsedInFilter(property, nestedFilter)
        ))
    );
  }

  private normalizeCustomPropertyMap<T extends MosaicEntity>(
    customPropertyMap: { [name: string]: string },
    options: ListQueryOptions<T>,
    qb: SelectQueryBuilder<T>
  ) {
    for (const [property] of Object.entries(customPropertyMap)) {
      if (!this.customPropertyIsBeingUsed(property, options)) {
        continue;
      }
      let parts = customPropertyMap[property].split('.');
      const normalizedRelationPath: string[] = [];
      let entityMetadata = qb.expressionMap.mainAlias?.metadata;
      let entityAlias = qb.alias;
      while (parts.length > 1) {
        const entityPart = 2 <= parts.length ? parts[0] : qb.alias;
        const columnPart = parts[parts.length - 1];

        if (!entityMetadata) {
          continue;
        }
        const relationMetadata =
          entityMetadata.findRelationWithPropertyPath(entityPart);
        if (!relationMetadata ?? !relationMetadata?.propertyName) {
          delete customPropertyMap[property];
          return;
        }
        const alias = `${entityMetadata.tableName}_${relationMetadata.propertyName}`;
        if (!this.isRelationAlreadyJoined(qb, alias)) {
          qb.leftJoinAndSelect(
            `${entityAlias}.${relationMetadata.propertyName}`,
            alias
          );
        }
        parts = parts.slice(1);
        entityMetadata = relationMetadata?.inverseEntityMetadata;
        normalizedRelationPath.push(entityAlias);

        if (parts.length === 1) {
          normalizedRelationPath.push(alias, columnPart);
        } else {
          entityAlias = alias;
        }
      }
      customPropertyMap[property] = normalizedRelationPath.slice(-2).join('.');
    }
  }

  private joinCalculatedColumnRelations<T extends MosaicEntity>(
    qb: SelectQueryBuilder<T>,
    entity: Type<T>,
    options: ListQueryOptions<T>
  ) {
    const calculatedColumns = getCalculatedColumns(entity);
    const filterAndSortFields = unique([
      ...Object.keys(options.filter || {}),
      ...Object.keys(options.sort || {}),
    ]);
    const alias = getEntityAlias(this.dataSource, entity);
    for (const field of filterAndSortFields) {
      const calculatedColumnDef = calculatedColumns.find(
        (c) => c.name === field
      );
      const instruction = calculatedColumnDef?.listQuery;
      if (instruction) {
        const relations = instruction.relations || [];
        for (const relation of relations) {
          const relationIsAlreadyJoined = qb.expressionMap.joinAttributes.find(
            (ja) => ja.entityOrProperty === `${alias}.${relation}`
          );
          if (!relationIsAlreadyJoined) {
            const propertyPath = relation.includes('.')
              ? relation
              : `${alias}.${relation}`;
            const relationAlias = relation.includes('.')
              ? relation.split('.').reverse()[0]
              : relation;
            qb.innerJoinAndSelect(propertyPath, relationAlias);
          }
        }
        if (typeof instruction.query === 'function') {
          instruction.query(qb as any);
        }
      }
    }
  }

  private isRelationAlreadyJoined<T extends MosaicEntity>(
    qb: SelectQueryBuilder<T>,
    alias: string
  ): boolean {
    return qb.expressionMap.joinAttributes.some(
      (ja) => ja.alias.name === alias
    );
  }
}
