export type ShippingMethod = {
  id: number;
  code: string;
  name: string;
};

export type ShippingLine = {
  id: number;
  shippingMethod: ShippingMethod;
};
