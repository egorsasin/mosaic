import { ConfigArgDef } from '../../common';

import { CategoryFilter } from './category-filter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { customAlphabet } = require('nanoid');

/**
 * @description
 * Used to created unique key names for DB query parameters, to avoid conflicts if the
 * same filter is applied multiple times.
 */
export function randomSuffix(prefix: string) {
  const nanoid = customAlphabet('123456789abcdefghijklmnopqrstuvwxyz', 6);
  return `${prefix}_${nanoid() as string}`;
}

/**
 * @description
 * Add this to your CollectionFilter `args` object to display the standard UI component
 * for selecting the combination mode when working with multiple filters.
 */
export const combineWithAndArg: ConfigArgDef<'boolean'> = {
  type: 'boolean',
  label: 'Combination mode',
  description:
    'If this filter is being combined with other filters, do all conditions need to be satisfied (AND), or just one or the other (OR)?',
  defaultValue: true,
  ui: {
    component: 'combination-mode-form-input',
  },
};

export const productIdCategoryFilter = new CategoryFilter({
  args: {
    productIds: {
      type: 'int',
      list: true,
      label: 'Products',
      ui: {
        component: 'product-multi-form-input',
        selectionMode: 'product',
      },
    },
    combineWithAnd: combineWithAndArg,
  },
  code: 'product-id-filter',
  description: 'Manually select products',
  apply: (qb, args) => {
    if (args.productIds.length === 0) {
      return qb;
    }
    const productIdsKey = randomSuffix('productIds');
    const clause = `product.id IN (:...${productIdsKey})`;
    const params = { [productIdsKey]: args.productIds };

    if (args.combineWithAnd === false) {
      return qb.orWhere(clause, params);
    } else {
      return qb.andWhere(clause, params);
    }
  },
});

export const defaultCategoryFilters = [productIdCategoryFilter];
