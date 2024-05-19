import { Product } from './product';

export type OrderLine = Node & {
  __typename?: 'OrderLine';
  id: number;
  quantity: number;
  product: Product;
};

export type Order = Node & {
  __typename?: 'Order';
  id: number;
  lines: OrderLine[];
  totalQuantity: number;
  total: number;
};
