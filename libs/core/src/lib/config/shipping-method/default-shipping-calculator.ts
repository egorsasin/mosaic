import { ShippingCalculator } from './shipping-calculator';

export const defaultShippingCalculator = new ShippingCalculator({
  code: 'default-shipping-calculator',
  description: 'Default Flat-Rate Shipping Calculator',
  args: {
    rate: {
      type: 'float',
      defaultValue: 0,
      ui: { component: 'currency-form-input' },
      label: 'Shipping price',
    },
    amount: {
      type: 'float',
      defaultValue: 0,
      ui: { component: 'currency-form-input' },
      label: 'Max order prics',
    },
  },
  calculate: (ctx, order, args) => {
    const { rate = 0, amount = 0 } = args;

    let price: number;

    if (amount) {
      price = !order.subTotal || order.subTotal >= amount ? 0 : rate;
    } else {
      price = rate;
    }

    return {
      price,
    };
  },
});
