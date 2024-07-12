import { GraphQLError } from 'graphql';

import { Exact, Order } from '@mosaic/common';

export type AdjustItemQuantityMutationVariables = Exact<{
  id: number;
  quantity: number;
}>;

export type AdjustItemQuantityMutation = {
  adjustOrderLine: Order | GraphQLError;
};
