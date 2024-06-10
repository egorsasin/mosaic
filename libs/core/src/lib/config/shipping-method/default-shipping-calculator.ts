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
    amount: {
      type: 'int',
      defaultValue: 0,
      ui: { component: 'currency-form-input' },
      label: 'Max order prics',
    },
  },
  calculate: (ctx, order, args) => {
    const { rate = 0, amount = null } = args;

    let price: number;
    if (amount) {
      price = order.subTotal >= amount ? 0 : rate;
    } else {
      price = rate;
    }

    return {
      price,
    };
  },
});
