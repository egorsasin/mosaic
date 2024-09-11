import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

import {
  DATA_SOURCE_PROVIDER,
  Order,
  OrderService,
  PaymentMethod,
  RequestContext,
  RequestContextService,
} from '@mosaic/core';
import { ConfigArg } from '@mosaic/common';

import { paynowPaymentMethodHandler } from './paynow.handler';
import { AxiosResponse } from 'axios';
import { PaynowPaymentIntent, RequestWithRawBody } from './types';
import { PaynowPaymentIntentResponse } from './paynow.types';

const MAX_VALUE_LENGTH = 50;

const computeHMACSignature = (
  payload: string,
  signatureKey: string,
  apiKey: string,
  idempotencyKey: string
): string => {
  const signatureBody = {
    headers: {
      'Api-Key': apiKey,
      'Idempotency-Key': idempotencyKey,
    },
    parameters: {},
    body: payload,
  };

  return crypto
    .createHmac('sha256', signatureKey)
    .update(JSON.stringify(signatureBody), 'utf8')
    .digest()
    .toString('base64');
};

export function sanitizeMetadata(metadata: any) {
  if (typeof metadata !== 'object' && metadata !== null) return {};

  const keys = Object.keys(metadata).filter(
    (keyName) =>
      typeof metadata[keyName] !== 'string' ||
      (metadata[keyName] as string).length <= MAX_VALUE_LENGTH
  );

  return keys.reduce((obj, keyName) => {
    obj[keyName] = metadata[keyName];
    return { ...obj, [keyName]: metadata[keyName] };
  }, {});
}

@Injectable()
export class PaynowService {
  constructor(
    private httpService: HttpService,
    private orderService: OrderService,
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}

  public async createPaymentIntent(
    ctx: RequestContext,
    order: Order
  ): Promise<PaynowPaymentIntent> {
    const paynowPaymentMethod: PaymentMethod = await this.dataSource
      .getRepository(PaymentMethod)
      .findOne({
        where: { enabled: true, code: paynowPaymentMethodHandler.code },
      });

    const { code, id, customer, total } = order;
    const { emailAddress = '', firstName = '', lastName = '' } = customer || {};

    const data = {
      amount: total,
      externalId: code,
      description: `Order #${id}`,
      buyer: sanitizeMetadata({ email: emailAddress, firstName, lastName }),
    };

    const apiKey = this.findOrThrowArgValue(
      paynowPaymentMethod.handler.args,
      'apiKey'
    );
    const signatureKey = this.findOrThrowArgValue(
      paynowPaymentMethod.handler.args,
      'signatureKey'
    );
    const idempotencyKey = `${order.code}_${total}`;

    const payload = JSON.stringify(data);
    const signature = computeHMACSignature(
      payload,
      signatureKey,
      apiKey,
      idempotencyKey
    );
    const headers = {
      'api-Key': apiKey,
      signature,
      'idempotency-key': idempotencyKey,
      'content-type': 'application/json',
    };

    let resp: AxiosResponse<PaynowPaymentIntentResponse, any>;
    try {
      resp = await firstValueFrom(
        this.httpService.post(
          'https://api.sandbox.paynow.pl/v3/payments',
          payload,
          { headers }
        )
      );
    } catch (error) {
      //
    }

    if (order.state !== 'ArrangingPayment') {
      const transitionToStateResult = await this.orderService.transitionToState(
        ctx,
        id,
        'ArrangingPayment'
      );

      const addPaymentToOrderResult = await this.orderService.addPaymentToOrder(
        ctx,
        order.id,
        { method: paynowPaymentMethod.code, metadata: resp.data }
      );
    }

    return { url: `${resp?.data?.redirectUrl}` };
  }

  private findOrThrowArgValue(args: ConfigArg[], name: string): string {
    const value = args.find((arg) => arg.name === name)?.value;
    if (!value) {
      throw Error(`No argument named '${name}' found!`);
    }
    return value;
  }
}
