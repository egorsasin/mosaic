import { createParamDecorator, ExecutionContext, Type } from '@nestjs/common';
import {
  getNamedType,
  GraphQLResolveInfo,
  GraphQLSchema,
  isObjectType,
} from 'graphql';
import { getMetadataArgsStorage } from 'typeorm';

import { InternalServerError, unique } from '@mosaic/common';

import {
  CalculatedColumnDefinition,
  CALCULATED_PROPERTIES,
} from '../../common/calculated-decorator';
import { MosaicEntity } from '../../data';
import { EntityRelationPaths } from '../../service/helpers/entity-hydrator/entity-hydrator.types';
import { TtlCache } from '../common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const graphqlFields = require('graphql-fields');

export type RelationPaths<T extends MosaicEntity> = Array<
  EntityRelationPaths<T>
>;

export type FieldsDecoratorConfig<T extends MosaicEntity> =
  | Type<T>
  | {
      entity: Type<T>;
      depth?: number;
      omit?: RelationPaths<T>;
    };

const DEFAULT_DEPTH = 3;

const cache = new TtlCache({ cacheSize: 500, ttl: 5 * 60 * 1000 });

export const Relations: <T extends MosaicEntity>(
  data: FieldsDecoratorConfig<T>
) => ParameterDecorator = createParamDecorator<FieldsDecoratorConfig<any>>(
  (data, ctx: ExecutionContext) => {
    const info = ctx.getArgByIndex(3);

    if (data == null) {
      throw new InternalServerError(
        'The @Relations() decorator requires an entity type argument'
      );
    }

    if (!isGraphQLResolveInfo(info)) {
      return [];
    }

    const cacheKey =
      info.fieldName + '__' + (ctx.getArgByIndex(2).req.body.query as string);
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    const fields = graphqlFields(info);
    const targetFields = isPaginatedListQuery(info)
      ? fields.items ?? {}
      : fields;
    const entity = typeof data === 'function' ? data : data.entity;
    const maxDepth =
      typeof data === 'function' ? DEFAULT_DEPTH : data.depth ?? DEFAULT_DEPTH;
    const omit = typeof data === 'function' ? [] : data.omit ?? [];
    const relationFields = getRelationPaths(targetFields, entity, maxDepth);

    let result = unique(relationFields);

    for (const omitPath of omit) {
      result = result.filter(
        (resultPath) => !resultPath.startsWith(omitPath as string)
      );
    }

    cache.set(cacheKey, result);

    return result;
  }
);

function getRelationPaths(
  fields: Record<string, Record<string, any>>,
  entity: Type<MosaicEntity>,
  maxDepth: number,
  depth = 1
): string[] {
  const relations = getMetadataArgsStorage().filterRelations(entity);
  const metadata = getMetadataArgsStorage();
  const relationPaths: string[] = [];
  for (const [property, value] of Object.entries(fields)) {
    if (property === 'customFields') {
      const customFieldEntity = metadata
        .filterEmbeddeds(entity)
        .find((e) => e.propertyName === 'customFields')
        ?.type();
      if (customFieldEntity) {
        if (depth < maxDepth) {
          depth++;
          const subPaths = getRelationPaths(
            value,
            customFieldEntity as Type<MosaicEntity>,
            maxDepth,
            depth
          );
          depth--;
          for (const subPath of subPaths) {
            relationPaths.push([property, subPath].join('.'));
          }
        }
      }
    } else {
      const relationMetadata = relations.find(
        (r) => r.propertyName === property
      );
      if (relationMetadata) {
        relationPaths.push(property);
        const relatedEntity =
          typeof relationMetadata.type === 'function'
            ? // https://github.com/microsoft/TypeScript/issues/37663
              (relationMetadata.type as any)()
            : relationMetadata.type;
        if (depth < maxDepth) {
          depth++;
          const subPaths = getRelationPaths(
            value,
            relatedEntity as Type<MosaicEntity>,
            maxDepth,
            depth
          );
          depth--;
          for (const subPath of subPaths) {
            relationPaths.push([property, subPath].join('.'));
          }
        }
      }
      const calculatedProperties: CalculatedColumnDefinition[] =
        Object.getPrototypeOf(new entity())[CALCULATED_PROPERTIES] ?? [];
      const selectedFields = new Set(Object.keys(fields));
      const dependencyRelations = calculatedProperties
        .filter(
          (p) =>
            selectedFields.has(p.name as string) &&
            p.listQuery?.relations?.length
        )
        .map((p) => p.listQuery?.relations ?? [])
        .flat();
      relationPaths.push(...dependencyRelations);
    }
  }
  return relationPaths;
}

function isGraphQLResolveInfo(input: unknown): input is GraphQLResolveInfo {
  return !!(
    input &&
    typeof input === 'object' &&
    (input as any).schema instanceof GraphQLSchema
  );
}

function isPaginatedListQuery(info: GraphQLResolveInfo): boolean {
  const returnType = getNamedType(info.returnType);
  return (
    isObjectType(returnType) &&
    !!returnType.getInterfaces().find((i) => i.name === 'PaginatedList')
  );
}
