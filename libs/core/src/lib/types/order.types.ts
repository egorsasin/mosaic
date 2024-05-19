import { NegativeQuantityError, OrderModificationError } from '../common';
import { Order } from '../data';

export type UpdateOrderItemsResult = Order | NegativeQuantityError;

export type RemoveOrderItemsResult = Order | OrderModificationError;

export type MutationAddItemToOrderArgs = {
  productId: number;
  quantity: number;
};

export type MutationRemoveOrderLineArgs = {
  orderLineId: number;
};

export type QueryOrderByCodeArgs = {
  code: string;
};
