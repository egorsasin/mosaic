import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { PaymentInput, PaymentMethodQuote, summate } from '@mosaic/common';

import { RequestContext, generatePublicId } from '../../api/common';
import { Order, OrderLine, Payment, DATA_SOURCE_PROVIDER } from '../../data';
import {
  ErrorResultUnion,
  NegativeQuantityError,
  OrderLimitError,
  OrderModificationError,
  OrderPaymentStateError,
  OrderStateTransitionError,
  isGraphQlErrorResult,
} from '../../common';
import {
  RemoveOrderItemResult,
  UpdateOrderItemsResult,
  OrderState,
} from '../../types';
import { OrderModifier } from '../helpers/order-modifier/order-modifier';
import { OrderStateMachine } from '../helpers/order-state-machine/order-state-machine';
import { ConfigService } from '../../config';
import { EventBus, OrderLineEvent } from '../../event-bus';

import { UserService } from './user.service';
import { PaymentService } from './payment.service';
import { PaymentMethodService } from './payment-method.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private readonly orderStateMachine: OrderStateMachine,
    private readonly userService: UserService,
    private readonly orderModifier: OrderModifier,
    private readonly paymentService: PaymentService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly configService: ConfigService,
    private eventBus: EventBus
  ) {}

  public async findOne(id: number): Promise<Order | undefined> {
    return this.dataSource
      .getRepository(Order)
      .findOne({ where: { id }, relations: ['lines', 'lines.product'] });
  }

  async findOneByCode(orderCode: string): Promise<Order | undefined> {
    return this.dataSource.getRepository(Order).findOne({
      where: {
        code: orderCode,
        active: true,
      },
    });
  }

  public async findActiveOrderById(id: number): Promise<Order | undefined> {
    return this.dataSource.getRepository(Order).findOne({
      where: {
        id,
        active: true,
      },
    });
  }

  public async getActiveOrderForUser(
    userId: number
  ): Promise<Order | undefined> {
    return this.dataSource.getRepository(Order).findOne({
      where: {
        user: { id: userId },
        active: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * @description
   * Returns an array of quotes stating which {@link PaymentMethod}s may be used on this Order.
   */
  async getEligiblePaymentMethods(
    ctx: RequestContext,
    orderId: number
  ): Promise<PaymentMethodQuote[]> {
    const order = await this.getOrderOrThrow(orderId);
    return this.paymentMethodService.getEligiblePaymentMethods(order);
  }

  public async create(userId?: number): Promise<Order> {
    const newOrder = await this.createEmptyOrderEntity();
    if (userId) {
      const user = await this.userService.getUserById(userId);
      if (user) {
        newOrder.user = user;
      }
    }

    const order = await this.dataSource.getRepository(Order).save(newOrder);
    return order;
  }

  public async addItemToOrder(
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<ErrorResultUnion<UpdateOrderItemsResult, Order>> {
    const order = await this.getOrderOrThrow(orderId);
    const validationError = this.assertQuantityIsPositive(quantity);
    if (validationError) {
      return validationError;
    }
    await this.orderModifier.getOrCreateOrderLine(order, productId, quantity);
    return this.findOne(orderId);
  }

  /**
   * Добавляет платеж к ордеру
   */
  async addPaymentToOrder(
    ctx: RequestContext,
    orderId: number,
    { method, metadata }: PaymentInput
  ): Promise<OrderPaymentStateError | Order> {
    const order = await this.getOrderOrThrow(orderId);

    // TODO Calculate ammount
    const amountToPay = 100;

    if (!this.canAddPaymentToOrder(order)) {
      return new OrderPaymentStateError();
    }

    // order.payments = await this.getOrderPayments(ctx, order.id);
    // const amountToPay = order.totalWithTax - totalCoveredByPayments(order);
    const payment = await this.paymentService.createPayment(
      ctx,
      order,
      amountToPay,
      method,
      metadata
    );

    if (isGraphQlErrorResult(payment)) {
      return payment;
    }
    // await this.connection
    //   .getRepository(ctx, Order)
    //   .createQueryBuilder()
    //   .relation('payments')
    //   .of(order)
    //   .add(payment);
    // if (payment.state === 'Error') {
    //   return new PaymentFailedError({
    //     paymentErrorMessage: payment.errorMessage || '',
    //   });
    // }
    // if (payment.state === 'Declined') {
    //   return new PaymentDeclinedError({
    //     paymentErrorMessage: payment.errorMessage || '',
    //   });
    // }
    return order;
  }

  /**
   * @description
   * Устанавливает количество в существующей строке заказа.
   */
  public async adjustOrderLine(
    ctx: RequestContext,
    orderId: number,
    orderLineId: number,
    quantity: number
  ): Promise<ErrorResultUnion<UpdateOrderItemsResult, Order>> {
    const order = await this.getOrderOrThrow(orderId);
    const orderLine = this.getOrderLineOrThrow(order, orderLineId);
    const validationError =
      this.assertAddingItemsState(order) ||
      this.assertQuantityIsPositive(quantity) ||
      this.assertNotOverOrderItemsLimit(order, quantity - orderLine.quantity) ||
      this.assertNotOverOrderLineItemsLimit(
        orderLine,
        quantity - orderLine.quantity
      );

    if (validationError) {
      return validationError;
    }

    await this.orderModifier.updateOrderLineQuantity(
      ctx,
      orderLine,
      quantity,
      order
    );
  }

  public async removeItemFromOrder(
    ctx: RequestContext,
    orderId: number,
    orderLineId: number
  ): Promise<ErrorResultUnion<RemoveOrderItemResult, Order>> {
    const order = await this.getOrderOrThrow(orderId);
    const validationError = this.assertAddingItemsState(order);

    if (validationError) {
      return validationError;
    }

    const orderLine = this.getOrderLineOrThrow(order, orderLineId);

    order.lines = order.lines.filter(({ id }: OrderLine) => id !== orderLineId);

    await this.dataSource.getRepository(OrderLine).remove(orderLine);
    await this.eventBus.publish(
      new OrderLineEvent(ctx, order, orderLine, 'deleted')
    );
    return order;
  }

  /**
   * @description
   * Transitions the Order to the given state.
   */
  async transitionToState(
    ctx: RequestContext,
    orderId: number,
    state: OrderState
  ): Promise<Order | OrderStateTransitionError> {
    const order = await this.getOrderOrThrow(orderId);
    order.payments = await this.getOrderPayments(orderId);

    const fromState = order.state;
    let finalize: () => Promise<unknown>;
    try {
      const result = await this.orderStateMachine.transition(ctx, order, state);

      finalize = result.finalize;
    } catch (e: any) {
      // const transitionError = ctx.translate(e.message, {
      //   fromState,
      //   toState: state,
      // });
      // return new OrderStateTransitionError({
      //   transitionError,
      //   fromState,
      //   toState: state,
      // });
    }
    // await this.connection
    //   .getRepository(ctx, Order)
    //   .save(order, { reload: false });
    // this.eventBus.publish(
    //   new OrderStateTransitionEvent(fromState, state, ctx, order)
    // );

    await finalize();
    await this.dataSource.getRepository(Order).save(order, { reload: false });

    return order;
  }

  /**
   * @description
   * Returns all {@link Payment} entities associated with the Order.
   */
  public getOrderPayments(orderId: number): Promise<Payment[]> {
    return this.dataSource.getRepository(Payment).find({
      where: {
        order: { id: orderId },
      },
    });
  }

  private assertQuantityIsPositive(quantity: number) {
    if (quantity < 0) {
      return new NegativeQuantityError();
    }
  }

  private async getOrderOrThrow(orderId: number): Promise<Order> {
    const order = await this.findOne(orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  private getOrderLineOrThrow(order: Order, orderLineId: number): OrderLine {
    const orderLine = order.lines.find(({ id }) => {
      if (!orderLineId || !id) {
        return false;
      }
      return orderLineId === id;
    });
    if (!orderLine) {
      throw new Error(`Order does not contain line with id ${orderLineId}`);
    }
    return orderLine;
  }

  private async createEmptyOrderEntity() {
    return new Order({
      state: this.orderStateMachine.getInitialState(),
      lines: [],
      code: generatePublicId(),
    });
  }

  /**
   * @description
   * Оплата может быть добавлена если:
   * 1. Ордер в статусе `ArrangingPayment` или
   * 2. Статус ордера может быть изменен на `PaymentAuthorized` и `PaymentSettled`
   */
  private canAddPaymentToOrder(order: Order): boolean {
    if (order.state === 'ArrangingPayment') {
      return true;
    }

    const canTransitionToPaymentAuthorized =
      this.orderStateMachine.canTransition(order.state, 'PaymentAuthorized');
    const canTransitionToPaymentSettled = this.orderStateMachine.canTransition(
      order.state,
      'PaymentSettled'
    );

    return canTransitionToPaymentAuthorized && canTransitionToPaymentSettled;
  }

  /**
   * Возвращает ошибку если указанное количество товаров в заказе
   * превышает максимальный лимит установленный в конфигурации
   */
  private assertNotOverOrderItemsLimit(
    order: Order,
    quantityToAdd: number
  ): OrderLimitError {
    const currentItemsCount = summate(order.lines, 'quantity');
    const { orderItemsLimit } = this.configService.orderOptions;

    if (orderItemsLimit < currentItemsCount + quantityToAdd) {
      return new OrderLimitError({ maxItems: orderItemsLimit });
    }
  }

  /**
   * Возвращает ошибку если указанное количество товаров в строке заказа
   * превышает максимальный лимит установленный в конфигурации
   */
  private assertNotOverOrderLineItemsLimit(
    orderLine: OrderLine | undefined,
    quantityToAdd: number
  ): OrderLimitError {
    const currentQuantity = orderLine?.quantity || 0;
    const { orderLineItemsLimit } = this.configService.orderOptions;

    if (orderLineItemsLimit < currentQuantity + quantityToAdd) {
      return new OrderLimitError({ maxItems: orderLineItemsLimit });
    }
  }

  private assertAddingItemsState(order: Order): OrderModificationError | null {
    const allowedStatuses = ['AddingItems', 'Draft'];
    return allowedStatuses.includes(order.state)
      ? null
      : new OrderModificationError();
  }
}
