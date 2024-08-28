import { SelectQueryBuilder } from 'typeorm';

import { ConfigArg, ConfigArgValues } from '../../types';
import {
  ConfigArgs,
  ConfigurableOperationDef,
  ConfigurableOperationDefOptions,
} from '../../common';
import { Product } from '../../data';

export type ApplyCategoryFilterFn<T extends ConfigArgs> = (
  qb: SelectQueryBuilder<Product>,
  args: ConfigArgValues<T>
) => SelectQueryBuilder<Product>;

export interface CategoryFilterConfig<T extends ConfigArgs>
  extends ConfigurableOperationDefOptions<T> {
  apply: ApplyCategoryFilterFn<T>;
}

export class CategoryFilter<
  T extends ConfigArgs = ConfigArgs
> extends ConfigurableOperationDef<T> {
  private readonly applyFn: ApplyCategoryFilterFn<T>;

  constructor(config: CategoryFilterConfig<T>) {
    super(config);
    this.applyFn = config.apply;
  }

  public apply(
    qb: SelectQueryBuilder<Product>,
    args: ConfigArg[]
  ): SelectQueryBuilder<Product> {
    return this.applyFn(qb, this.argsArrayToHash(args));
  }
}
