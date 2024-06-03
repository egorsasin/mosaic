import { ShippingCalculator } from './shipping-calculator';

export const defaultShippingCalculator = new ShippingCalculator({
  code: 'default-shipping-calculator',
  description: 'Default Flat-Rate Shipping Calculator',
  args: {
    rate: {
      type: 'int',
      defaultValue: 0,
      ui: { component: 'currency-form-input' },
      label: 'Shipping price',
    },
  },
  calculate: (ctx, order, args) => {
    return {
      price: args.rate || 0,
    };
  },
});
