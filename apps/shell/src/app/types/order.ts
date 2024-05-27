import { Product } from './product';

export type OrderLine = Node & {
  id: number;
  quantity: number;
  product: Product;
};

export type Order = Node & {
  id: number;
  lines: OrderLine[];
  totalQuantity: number;
};
