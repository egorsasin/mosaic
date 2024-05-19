export type Address = Node & {
  __typename?: 'Address';
  id: number;
  default: boolean;
  city: string;
};

export type Customer = Node & {
  __typename?: 'Customer';
  id: number;
  addresses: Address[];
  firstName: string;
  lastName: string;
};
