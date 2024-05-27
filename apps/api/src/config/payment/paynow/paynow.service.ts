import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

import { DATA_SOURCE_PROVIDER, Order, PaymentMethod } from '@mosaic/core';
import { ConfigArg } from '@mosaic/common';

import { paynowPaymentMethodHandler } from './paynow.handler';
import { AxiosResponse } from 'axios';
import { PaynowPaymentIntent } from './types';

const computeHMACSignature = (payload: string, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest()
    .toString('base64');
};

@Injectable()
export class PaynowService {
  constructor(
    private httpService: HttpService,
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}

  public async createPaymentIntent(order: Order): Promise<PaynowPaymentIntent> {
    const paynowPaymentMethod: PaymentMethod = await this.dataSource
      .getRepository(PaymentMethod)
      .findOne({
        where: { enabled: true, code: paynowPaymentMethodHandler.code },
      });

    const amountInMinorUnits = 10000;

    const data = {
      amount: amountInMinorUnits,
      externalId: order.code,
      description: 'Order 235',
      buyer: {
        email: 'jan.kowalski@melements.pl',
      },
    };

    const apiKey = this.findOrThrowArgValue(
      paynowPaymentMethod.handler.args,
      'apiKey'
    );
    const signatureKey = this.findOrThrowArgValue(
      paynowPaymentMethod.handler.args,
      'signatureKey'
    );

    const payload = JSON.stringify(data);
    const signature = computeHMACSignature(payload, signatureKey);
    const headers = {
      'api-Key': apiKey,
      signature,
      'idempotency-key': `${order.code}_${amountInMinorUnits}`,
      'content-type': 'application/json',
    };

    let resp: AxiosResponse<any, any>;
    try {
      resp = await firstValueFrom(
        this.httpService.post(
          'https://api.sandbox.paynow.pl/v1/payments',
          payload,
          { headers }
        )
      );
    } catch (error) {
      // TODO Handle error
    }

    return { url: `${resp.data?.redirectUrl}` };
  }

  private findOrThrowArgValue(args: ConfigArg[], name: string): string {
    const value = args.find((arg) => arg.name === name)?.value;
    if (!value) {
      throw Error(`No argument named '${name}' found!`);
    }
    return value;
  }
}
