import { OrderModificationError } from '@mosaic/common';

import { NegativeQuantityError, OrderLimitError } from '../common';
import { Order } from '../data';

export type UpdateOrderItemsResult =
  | Order
  | NegativeQuantityError
  | OrderModificationError
  | OrderLimitError;

export type RemoveOrderItemResult = Order | OrderModificationError;

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

export type MutationAdjustOrderLineArgs = {
  orderLineId: number;
  quantity: number;
};
