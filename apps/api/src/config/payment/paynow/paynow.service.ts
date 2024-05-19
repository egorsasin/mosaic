import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const computeHMACSignature = (payload: string, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest()
    .toString('base64');
};

@Injectable()
export class PaynowService {
  async createPaymentIntent(): Promise<string> {
    const payload = `{
    "amount": "12345",
    "externalId": "12345",
    "description": "Payment description",
    "buyer": {
        "email": "jan.kowalski@melements.pl"
    }
}`;

    const payload3 = {
      amount: '12345',
      externalId: '12345',
      description: 'Payment description',
      buyer: {
        email: 'jan.kowalski@melements.pl',
      },
    };

    const ddd = JSON.stringify(payload3);

    const secret = '5f6e5786-cb16-4c66-b411-27af32b15f0f';

    console.log('__DDDD', ddd);

    const comp = computeHMACSignature(
      '{"amount":"12345","externalId":"12345","description":"Payment description","buyer":{"email":"jan.kowalski@melements.pl"}}',
      secret
    );
    console.log('__RES', comp);

    const result = crypto
      .createHmac('sha256', secret)
      .update(ddd)
      .digest()
      .toString('base64');

    return `https://google.com?key=${result}`;
  }
}
