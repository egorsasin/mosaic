import { Type } from '@nestjs/common';

import {
  CalculatedColumnDefinition,
  CALCULATED_PROPERTIES,
} from '../../../common/calculated-decorator';
import { MosaicEntity } from '../../../data';

/**
 * @description
 * Returns calculated columns definitions for the given entity type.
 */
export function getCalculatedColumns<T extends MosaicEntity = MosaicEntity>(
  entity: Type<T>
) {
  const calculatedColumns: CalculatedColumnDefinition[] = [];
  const prototype = entity.prototype;
  if (Object.prototype.hasOwnProperty.call(prototype, CALCULATED_PROPERTIES)) {
    for (const property of prototype[CALCULATED_PROPERTIES]) {
      calculatedColumns.push(property);
    }
  }
  return calculatedColumns;
}
