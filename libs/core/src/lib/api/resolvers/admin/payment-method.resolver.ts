import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  PaginatedList,
  ConfigurableOperationDefinition,
  CreatePaymentMethodInput,
  MutationArgs,
} from '@mosaic/common';

import { QueryListArgs } from '../../../types';
import { PaymentMethod } from '../../../data';
import { PaymentMethodService } from '../../../service/services/payment-method.service';
import { Allow } from '../../decorators';
import { Permission } from '../../common';

@Resolver()
export class PaymentMethodResolver {
  constructor(private paymentMethodService: PaymentMethodService) {}

  @Query()
  @Allow(Permission.Authenticated)
  public paymentMethods(
    @Args() args: QueryListArgs
  ): Promise<PaginatedList<PaymentMethod>> {
    return this.paymentMethodService.findAll(args.options || undefined);
  }

  @Query()
  @Allow(Permission.Authenticated)
  public paymentMethodHandlers(): ConfigurableOperationDefinition[] {
    return this.paymentMethodService.getPaymentMethodHandlers();
  }

  @Mutation()
  @Allow(Permission.Authenticated)
  createPaymentMethod(
    @Args() { input }: MutationArgs<CreatePaymentMethodInput>
  ): Promise<PaymentMethod> {
    return this.paymentMethodService.create(input);
  }
}
