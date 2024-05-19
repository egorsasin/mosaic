import { Exact } from '../../../types';

export type CreateAddressInput = {
  city: string;
  default: boolean;
};

export type CreateAddressMutation = {
  createCustomerAddress: {
    id: string;
    city?: string;
    default?: boolean;
  };
};

export type CreateAddressMutationVariables = Exact<{
  input: CreateAddressInput;
}>;
