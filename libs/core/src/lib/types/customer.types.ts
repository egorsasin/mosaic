import { Maybe } from '@mosaic/common';

export type MutationCreateCustomerAddressArgs = {
  customerId: number;
  input: CreateAddressInput;
};

export type CreateAddressInput = {
  city?: Maybe<string>;
  default?: Maybe<boolean>;
};
