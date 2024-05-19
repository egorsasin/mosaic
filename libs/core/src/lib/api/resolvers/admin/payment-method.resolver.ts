import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  ConfigurableOperationDefinition,
  CreatePaymentMethodInput,
  MutationArgs,
} from '@mosaic/common';

import { PaginatedList, QueryListArgs } from '../../../types';
import { PaymentMethod } from '../../../data';
import { PaymentMethodService } from '../../../service/services';

@Resolver()
export class PaymentMethodResolver {
  constructor(private paymentMethodService: PaymentMethodService) {}

  @Query()
  public paymentMethods(
    @Args() args: QueryListArgs
  ): Promise<PaginatedList<PaymentMethod>> {
    return this.paymentMethodService.findAll(args.options || undefined);
  }

  @Query()
  public paymentMethodHandlers(): ConfigurableOperationDefinition[] {
    return this.paymentMethodService.getPaymentMethodHandlers();
  }

  @Mutation()
  createPaymentMethod(
    @Args() { input }: MutationArgs<CreatePaymentMethodInput>
  ): Promise<PaymentMethod> {
    return this.paymentMethodService.create(input);
  }
}
