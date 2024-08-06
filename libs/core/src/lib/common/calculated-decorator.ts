import { SelectQueryBuilder } from 'typeorm';

export const CALCULATED_PROPERTIES = '__mosCalculatedProperties__';

export interface CalculatedColumnQueryInstruction {
  relations?: string[];
  query?: (qb: SelectQueryBuilder<undefined>) => void;
  expression?: string;
}

export interface CalculatedColumnDefinition {
  name: string | symbol;
  listQuery?: CalculatedColumnQueryInstruction;
}

export function Calculated<T>(
  queryInstruction?: CalculatedColumnQueryInstruction
): MethodDecorator {
  return (target: T, propertyKey: string | symbol) => {
    const definition: CalculatedColumnDefinition = {
      name: propertyKey,
      listQuery: queryInstruction,
    };
    if (target[CALCULATED_PROPERTIES]) {
      if (
        !target[CALCULATED_PROPERTIES].map(
          (p: CalculatedColumnDefinition) => p.name
        ).includes(definition.name)
      ) {
        target[CALCULATED_PROPERTIES].push(definition);
      }
    } else {
      target[CALCULATED_PROPERTIES] = [definition];
    }
  };
}
