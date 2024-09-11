import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { pick } from '@mosaic/common';

import { Payment } from '../../../data';
import { PaymentMetadata } from '../../../types';
import { PaymentMethodService } from '../../../service';

@Resolver('Payment')
export class PaymentEntityResolver {
  constructor(private paymentMethodService: PaymentMethodService) {}

  @ResolveField()
  public metadata(@Parent() payment: Payment): PaymentMetadata {
    return pick(payment.metadata, ['public']);
  }

  @ResolveField()
  public async method(@Parent() payment: Payment): Promise<string> {
    const method = await this.paymentMethodService.findOneByCode(
      payment.method
    );
    return method.name || '';
  }
}
