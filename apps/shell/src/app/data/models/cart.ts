import { GraphQLError } from 'graphql';

import { Exact, Order } from '@mosaic/common';

export type RemoveItemFromCartMutation = {
  removeOrderLine: Order | GraphQLError;
};

export type RemoveItemFromCartMutationVariables = Exact<{
  id: number;
}>;

export type AddToCartMutation = { addItemToOrder: Order };

export type AddToCartMutationVariables = Exact<{
  productId: number;
  quantity: number;
}>;
