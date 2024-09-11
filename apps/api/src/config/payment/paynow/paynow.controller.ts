import { OrderService } from '@mosaic/core';
import { Controller, Headers, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';

import { PaynowPaymentIntentStatus } from './paynow.types';
import { RequestWithRawBody } from './types';

const missingHeaderErrorMessage = 'Missing Paynow signature header';
const noPaymentIntentErrorMessage =
  'No payment data is provided in the payload';

interface PaynowPaymentIntent {
  /**
   * Unique identifier for the object.
   */
  paymentId: string;
  externalId: string;
  status: PaynowPaymentIntentStatus;
  modifiedAt: Date;
}

// const generate = (payload: string, secret: string): string => {
//   return crypto
//     .createHmac('sha256', secret)
//     .update(payload, 'utf8')
//     .digest()
//     .toString('base64');
// };

// curl -X POST \
// <notification URL> \
// -H 'Signature: F69sbjUxBX4eFjfUal/Y9XGREbfaRjh/zdq9j4MWeHM=' \
// -H 'Content-Type: application/json' \
// -d \
// '{
//   "paymentId": "NOLV-8F9-08K-WGD",
//   "externalId": "9fea23c7-cd5c-4884-9842-6f8592be65df",
//   "status": "CONFIRMED",
//   "modifiedAt": "2024--06-01T13:24:52"
// }'

@Controller('payments')
export class PaynowController {
  constructor(private orderService: OrderService) {}

  @Post('paynow')
  public async webhook(
    @Headers('Signature') signature: string | undefined,
    @Req() request: RequestWithRawBody,
    @Res() response: Response
  ): Promise<void> {
    // if (!signature) {
    //   response.status(HttpStatus.BAD_REQUEST).send(missingHeaderErrorMessage);
    //   return;
    // }
    // const event = JSON.parse(request.body.toString());
    // const paymentIntent = event.data.object as PaynowPaymentIntent;
    // if (!paymentIntent) {
    //   response.status(HttpStatus.BAD_REQUEST).send(noPaymentIntentErrorMessage);
    //   return;
    // }
    // Wrap with transaction
    //const order = await this.orderService.findOneByCode(request.externalId);
  }
}
