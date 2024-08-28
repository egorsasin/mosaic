import { EntityMetadata, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { DriverUtils } from 'typeorm/driver/DriverUtils';

import { MosaicEntity } from '../../../data';
import { findOptionsObjectToArray } from '../utils';

/**
 * @description
 * Check if the current entity has one or more self-referencing relations
 * to determine if it is a tree type or has tree relations.
 * @param metadata
 * @private
 */
function isTreeEntityMetadata(metadata: EntityMetadata): boolean {
  if (metadata.treeType !== undefined) {
    return true;
  }

  for (const relation of metadata.relations) {
    if (relation.isTreeParent || relation.isTreeChildren) {
      return true;
    }
    if (relation.inverseEntityMetadata === metadata) {
      return true;
    }
  }
  return false;
}

export function joinTreeRelationsDynamically<T extends MosaicEntity>(
  qb: SelectQueryBuilder<T>,
  entity: EntityTarget<T>,
  requestedRelations: FindOneOptions['relations'] = {},
  maxEagerDepth = 1
): Map<string, string> {
  const joinedRelations = new Map<string, string>();
  const relationsArray = findOptionsObjectToArray(requestedRelations);
  if (!relationsArray.length) {
    return joinedRelations;
  }

  const sourceMetadata = qb.connection.getMetadata(entity);
  const sourceMetadataIsTree = isTreeEntityMetadata(sourceMetadata);

  const processRelation = (
    currentMetadata: EntityMetadata,
    parentMetadataIsTree: boolean,
    currentPath: string,
    currentAlias: string,
    parentPath?: string[],
    eagerDepth = 0
  ) => {
    if (currentPath === '') {
      return;
    }

    parentPath = parentPath?.filter((p) => p !== '');

    const currentMetadataIsTree =
      isTreeEntityMetadata(currentMetadata) ||
      sourceMetadataIsTree ||
      parentMetadataIsTree;
    if (!currentMetadataIsTree) {
      return;
    }

    const parts = currentPath.split('.');
    let part = parts.shift();

    if (!part || !currentMetadata) return;

    if (part === 'customFields' && parts.length > 0) {
      const relation = parts.shift();
      if (!relation) return;
      part += `.${relation}`;
    }

    const relationMetadata = currentMetadata.findRelationWithPropertyPath(part);

    if (!relationMetadata) {
      return;
    }

    let joinConnector = '_';
    if (relationMetadata.isEager) {
      joinConnector = '__';
    }
    const nextAlias = DriverUtils.buildAlias(
      qb.connection.driver,
      { shorten: false },
      currentAlias,
      part.replace(/\./g, joinConnector)
    );
    const nextPath = parts.join('.');
    const fullPath = [...(parentPath || []), part].join('.');
    if (
      !qb.expressionMap.joinAttributes.some((ja) => ja.alias.name === nextAlias)
    ) {
      qb.leftJoinAndSelect(`${currentAlias}.${part}`, nextAlias);
      joinedRelations.set(fullPath, nextAlias);
    }

    const inverseEntityMetadataIsTree = isTreeEntityMetadata(
      relationMetadata.inverseEntityMetadata
    );

    if (!currentMetadataIsTree && !inverseEntityMetadataIsTree) {
      return;
    }

    const newEagerDepth = relationMetadata.isEager
      ? eagerDepth + 1
      : eagerDepth;

    if (newEagerDepth <= maxEagerDepth) {
      relationMetadata.inverseEntityMetadata.relations.forEach(
        (subRelation) => {
          if (subRelation.isEager) {
            processRelation(
              relationMetadata.inverseEntityMetadata,
              currentMetadataIsTree,
              subRelation.propertyPath,
              nextAlias,
              [fullPath],
              newEagerDepth
            );
          }
        }
      );
    }

    if (nextPath) {
      processRelation(
        relationMetadata.inverseEntityMetadata,
        currentMetadataIsTree,
        nextPath,
        nextAlias,
        [fullPath]
      );
    }
  };

  relationsArray.forEach((relationPath) => {
    if (!joinedRelations.has(relationPath)) {
      processRelation(
        sourceMetadata,
        sourceMetadataIsTree,
        relationPath,
        qb.alias
      );
    }
  });

  return joinedRelations;
}
