import { DataSource } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';

import {
  ConfigurableOperationDefinition,
  CreatePaymentMethodInput,
  PaymentMethodQuote,
  assertFound,
  UserInputError,
} from '@mosaic/common';

import { Order, PaymentMethod, DATA_SOURCE_PROVIDER } from '../../data';
import { ConfigArgs, PaginatedList } from '../../common';
import { ConfigOptionsService } from '../helpers/config-options';
import { PaymentMethodHandler } from '../../config';
import { RequestContext } from '../../api/common';
import { ConfigArgService } from '../helpers/config-args';
import { ConfigurableOperation, ListQueryOptions } from '../../types';

const PAYMENT_METHOD_HANDLER = 'PaymentMethodHandler';

@Injectable()
export class PaymentMethodService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private configOptionsService: ConfigOptionsService,
    private configArgService: ConfigArgService
  ) {}

  public findOne(id: number): Promise<PaymentMethod | undefined> {
    return this.dataSource
      .getRepository(PaymentMethod)
      .findOne({ where: { id } });
  }

  public findOneByCode(code: string): Promise<PaymentMethod | undefined> {
    return this.dataSource
      .getRepository(PaymentMethod)
      .findOne({ where: { code } });
  }

  public async findAll(
    options?: ListQueryOptions<PaymentMethod>
  ): Promise<PaginatedList<PaymentMethod>> {
    return this.dataSource
      .getRepository(PaymentMethod)
      .findAndCount(options)
      .then(async ([items, totalItems]) => ({
        items,
        totalItems,
      }));
  }

  public getPaymentMethodHandlers(): ConfigurableOperationDefinition[] {
    return this.configArgService
      .getDefinitions(PAYMENT_METHOD_HANDLER)
      .map((definition: PaymentMethodHandler<ConfigArgs>) =>
        definition.toGraphQlType()
      );
  }

  public async getMethodAndOperations(
    ctx: RequestContext,
    code: string
  ): Promise<{
    paymentMethod: PaymentMethod;
    handler: PaymentMethodHandler;
  }> {
    // Получаем платежный метод по коду
    const paymentMethod = await this.dataSource
      .getRepository(PaymentMethod)
      .findOne({
        where: {
          code: code,
        },
      });

    if (!paymentMethod) {
      throw new UserInputError('ERROR.PAYMENT_METHOD_NOT_FOUND', { code });
    }

    // Получаем по коду обработчик платежей платежной системы
    const handler = this.configOptionsService.getByCode(
      PAYMENT_METHOD_HANDLER,
      paymentMethod.handler.code
    );

    return { paymentMethod, handler };
  }

  public async create(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    const handler: ConfigurableOperation = this.configArgService.parseInput(
      PAYMENT_METHOD_HANDLER,
      input.handler
    );
    const paymentMethod = new PaymentMethod({ ...input, handler });
    const savedPaymentMethod = await this.dataSource
      .getRepository(PaymentMethod)
      .save(paymentMethod);

    return assertFound(this.findOne(savedPaymentMethod.id));
  }

  public async getEligiblePaymentMethods(
    order: Order
  ): Promise<PaymentMethodQuote[]> {
    const paymentMethods = await this.dataSource
      .getRepository(PaymentMethod)
      .find({ where: { enabled: true } });

    return paymentMethods.map((method: PaymentMethod) => {
      const isEligible = true;
      let eligibilityMessage: string | undefined;
      // TODO Implement eligibility check

      const { id, code, name, description } = method;
      return {
        id,
        code,
        name,
        description,
        isEligible,
        eligibilityMessage,
      };
    });
  }
}
