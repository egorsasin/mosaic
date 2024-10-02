import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

import {
  DATA_SOURCE_PROVIDER,
  Order,
  OrderService,
  OrderStateTransitionError,
  Payment,
  PaymentMethod,
  RequestContext,
} from '@mosaic/core';
import {
  ConfigArg,
  ErrorCode,
  InternalServerError,
  NoActiveOrderError,
} from '@mosaic/common';

import { paynowPaymentMethodHandler } from './paynow.handler';
import { AxiosResponse } from 'axios';
import { PaynowPaymentIntent } from './types';
import {
  PaynowPaymentError,
  PaynowPaymentIntentResponse,
  paynowPaymentStateMap,
} from './paynow.types';

class PaymentError implements PaynowPaymentError {
  errorCode = ErrorCode.NO_ACTIVE_ORDER_ERROR;

  constructor(public message: string) {}
}

const MAX_VALUE_LENGTH = 50;
const API_PATH = 'https://api.sandbox.paynow.pl/v3';

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

    const { code, id, customer, total, state } = order;
    const { emailAddress = '', firstName = '', lastName = '' } = customer || {};

    const data = {
      amount: total,
      externalId: code,
      description: `Order #${id}`,
      buyer: sanitizeMetadata({ email: emailAddress, firstName, lastName }),
    };

    const idempotencyKey = `${code}`;
    const payload = JSON.stringify(data);
    const headers = await this.generateHeaders(payload, idempotencyKey);

    let resp: AxiosResponse<PaynowPaymentIntentResponse, any>;
    try {
      resp = await firstValueFrom(
        this.httpService.post(`${API_PATH}/payments`, payload, { headers })
      );
    } catch (error) {
      throw Error('Failed to create payment intent');
    }

    if (state !== 'ArrangingPayment') {
      const transitionToStateResult = await this.orderService.transitionToState(
        ctx,
        id,
        'ArrangingPayment'
      );

      if (transitionToStateResult instanceof OrderStateTransitionError) {
        throw Error('Failed to create payment intent');
      }

      const addPaymentToOrderResult = await this.orderService.addPaymentToOrder(
        ctx,
        order.id,
        {
          method: paynowPaymentMethod.code,
          metadata: { ...resp.data, idempotencyKey },
        }
      );
    }

    return { url: resp?.data?.redirectUrl, paymentId: resp?.data?.paymentId };
  }

  public async syncPaymentState(
    ctx: RequestContext,
    transactionId: string
  ): Promise<any | PaymentError> {
    const payment: Payment = await this.dataSource
      .getRepository(Payment)
      .findOne({
        where: {
          transactionId,
          method: paynowPaymentMethodHandler.code,
        },
        relations: ['order'],
      });

    if (!payment?.order) {
      return new NoActiveOrderError();
    }

    const headers = await this.generateHeaders('', payment.order.code);

    let resp: AxiosResponse<PaynowPaymentIntentResponse, any>;
    try {
      resp = await firstValueFrom(
        this.httpService.get(`${API_PATH}/payments/${transactionId}/status`, {
          headers,
        })
      );
    } catch (error) {
      // DO Nothing
    }

    if (resp) {
      const { status } = resp.data;
      await this.orderService.transitionPaymentToState(
        ctx,
        payment.id,
        paynowPaymentStateMap[status]
      );
    }

    return { orderCode: payment.order.code };
  }

  private async generateHeaders(payload: string, idempotencyKey: string) {
    const paymentMethod: PaymentMethod = await this.getPaymentMethod();

    const apiKey = this.findOrThrowArgValue(
      paymentMethod?.handler?.args,
      'apiKey'
    );
    const signatureKey = this.findOrThrowArgValue(
      paymentMethod?.handler?.args,
      'signatureKey'
    );

    const signature = computeHMACSignature(
      payload,
      signatureKey,
      apiKey,
      idempotencyKey
    );

    return {
      'api-Key': apiKey,
      signature,
      'idempotency-key': idempotencyKey,
      'content-type': 'application/json',
    };
  }

  private async getPaymentMethod(): Promise<PaymentMethod> {
    const method: PaymentMethod = await this.dataSource
      .getRepository(PaymentMethod)
      .findOne({
        where: { enabled: true, code: paynowPaymentMethodHandler.code },
      });

    if (!method) {
      throw new InternalServerError('Could not find Stripe PaymentMethod');
    }

    return method;
  }

  private findOrThrowArgValue(args: ConfigArg[] = [], name: string): string {
    const value = args.find((arg) => arg.name === name)?.value;
    if (!value) {
      throw Error(`No argument named '${name}' found!`);
    }
    return value;
  }
}
