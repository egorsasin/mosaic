import { Product } from './product';

export type OrderLine = {
  id: number;
  quantity: number;
  product: Product;
  proratedLinePrice: number;
};

export type ShippingMethod = {
  id: number;
  code: string;
  name: string;
};

export type ShippingLine = {
  id: number;
  shippingMethod: ShippingMethod;
};

export type Order = {
  id: number;
  lines: OrderLine[];
  totalQuantity: number;
  total: number;
  shipping: number;
};
