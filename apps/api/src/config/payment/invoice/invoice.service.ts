import { Injectable } from '@nestjs/common';
import * as tmp from 'tmp';

import { Order } from '@mosaic/core/data';
import { OrderService } from '@mosaic/core/service/services/order.service';

import * as pdf from 'pdf-creator-node';
import { Invoice } from './invoice.entity';

export async function createTempFile(postfix: string): Promise<string> {
  return new Promise((resolve, reject) => {
    tmp.file({ postfix }, (err: Error, path: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(path);
      }
    });
  });
}

@Injectable()
export class InvoiceService {
  constructor(private orderService: OrderService) {}

  public async createInvoiceForOrder(
    channelToken: string,
    orderId: number
  ): Promise<Invoice> {
    const order = this.orderService.findOne(orderId);

    return new Invoice({});
  }

  private async generatePdfFile(
    templateString: string,
    order: Order
  ): Promise<string> {
    const tmpFilePath = await createTempFile('.pdf');
    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      timeout: 1000 * 60 * 5,
      childProcessOptions: {
        env: {
          OPENSSL_CONF: '/dev/null',
        },
      },
    };

    try {
      await pdf.create(document, options);
    } catch (e: any) {
      // DO Nothing
    }

    return '';
  }
}
