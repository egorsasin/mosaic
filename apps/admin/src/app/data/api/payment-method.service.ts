import { Injectable } from '@angular/core';

import {
  CreatePaymentMethodInput,
  CreatePaymentMethodMutation,
  MutationArgs,
  pick,
} from '@mosaic/common';

import { BaseDataService } from './base-data.service';
import {
  CREATE_PAYMENT_METHOD,
  GET_PAYMENT_METHOD_LIST,
  GET_PAYMENT_METHOD_OPERATIONS,
} from '../definitions';

@Injectable()
export class PaymentMethodDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getPaymentMethods(options: any) {
    return this.baseDataService.query<any, any>(GET_PAYMENT_METHOD_LIST, {
      options,
    }) as any;
  }

  public getPaymentMethodOperations() {
    return this.baseDataService.query<any>(GET_PAYMENT_METHOD_OPERATIONS);
  }

  public createPaymentMethod(input: CreatePaymentMethodInput) {
    return this.baseDataService.mutate<
      CreatePaymentMethodMutation,
      MutationArgs<CreatePaymentMethodInput>
    >(CREATE_PAYMENT_METHOD, {
      input: pick(input, ['code', 'handler', 'name', 'description', 'enabled']),
    });
  }
}
