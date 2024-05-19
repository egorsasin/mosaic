import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

import { DataService } from '../data/data.service';
import { Customer } from '../types';

export type GetActiveCustomerQuery = {
  activeCustomer: Customer;
};

export const ADDRESS_FRAGMENT = gql`
  fragment Address on Address {
    id
    city
    default
  }
`;

export const GET_ACTIVE_CUSTOMER = gql`
  query GetActiveCustomer {
    activeCustomer {
      id
      firstName
      lastName
      addresses {
        ...Address
      }
    }
  }
  ${ADDRESS_FRAGMENT}
`;

@Injectable()
export class CustomerService {
  constructor(private dataService: DataService) {}

  public getActiveCustomer(): Observable<Customer> {
    return this.dataService
      .query<GetActiveCustomerQuery>(GET_ACTIVE_CUSTOMER, {}, 'network-only')
      .stream$.pipe(map(({ activeCustomer }) => activeCustomer));
  }
}
