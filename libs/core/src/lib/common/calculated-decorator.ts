import { SelectQueryBuilder } from 'typeorm';

export const CALCULATED_PROPERTIES = '__calculatedProperties__';

export interface CalculatedColumnQueryInstruction {
  relations?: string[];
  query?: (qb: SelectQueryBuilder<any>) => void;
  expression?: string;
}

export interface CalculatedColumnDefinition {
  name: string | symbol;
  listQuery?: CalculatedColumnQueryInstruction;
}

export function Calculated<T>(
  queryInstruction?: CalculatedColumnQueryInstruction
): MethodDecorator {
  return (
    target: T,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    console.log(target);
  };
}
