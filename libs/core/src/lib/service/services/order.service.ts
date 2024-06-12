import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
  PaymentInput,
  PaymentMethodQuote,
  ShippingMethodQuote,
  assertFound,
  OrderPaymentStateError,
  OrderModificationError,
  omit,
  summate,
  AddressInput,
  PaymentFailedError,
  PaymentDeclinedError,
} from '@mosaic/common';

import { RequestContext, generatePublicId } from '../../api/common';
import {
  Order,
  OrderLine,
  Payment,
  DATA_SOURCE_PROVIDER,
  Customer,
} from '../../data';
import {
  ListQueryOptions,
  NegativeQuantityError,
  OrderLimitError,
  OrderStateTransitionError,
  PaginatedList,
  isGraphQlErrorResult,
} from '../../common';
import {
  RemoveOrderItemResult,
  UpdateOrderItemsResult,
  OrderState,
} from '../../types';
import { OrderModifier } from '../helpers/order-modifier/order-modifier';
import { OrderStateMachine } from '../helpers/order-state-machine/order-state-machine';
import { OrderCalculator } from '../helpers/order-calculator/order-calculator';
import { ShippingCalculator } from '../helpers/shipping-calculator';
import { EligibleShippingMethod } from '../helpers/shipping-calculator/shipping-calculator';
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
    private readonly orderCalculator: OrderCalculator,
    private shippingCalculator: ShippingCalculator,
    private readonly paymentService: PaymentService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly configService: ConfigService,
    private eventBus: EventBus
  ) {}

  public async findAll(
    options?: ListQueryOptions
  ): Promise<PaginatedList<Order>> {
    return this.dataSource
      .getRepository(Order)
      .findAndCount({
        ...options,
        relations: [
          'lines',
          'shippingLine',
          'payments',
          'lines.product',
          'shippingLine.shippingMethod',
        ],
      })
      .then(async ([items, totalItems]) => ({
        items,
        totalItems,
      }));
  }

  public async findOne(
    id: number,
    relations?: string[]
  ): Promise<Order | undefined> {
    return this.dataSource.getRepository(Order).findOne({
      where: { id },
      relations: relations || [
        'lines',
        'lines.product',
        'shippingLine',
        'shippingLine.shippingMethod',
      ],
    });
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
        //user: { id: userId },
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
        // newOrder.user = user;
      }
    }

    const order = await this.dataSource.getRepository(Order).save(newOrder);
    return order;
  }

  public async addItemToOrder(
    ctx: RequestContext,
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<UpdateOrderItemsResult | Order> {
    // Получаем ордер по ИД или возвращаем ошибку если ордер не найден
    const order = await this.getOrderOrThrow(orderId);
    const existingOrderLine = order.lines.find(
      ({ product }: OrderLine) => product.id === productId
    );

    const validationError =
      this.assertQuantityIsPositive(quantity) ||
      this.assertAddingItemsState(order) ||
      this.assertNotOverOrderItemsLimit(order, quantity) ||
      this.assertNotOverOrderLineItemsLimit(existingOrderLine, quantity);

    if (validationError) {
      return validationError;
    }

    const orderLine = await this.orderModifier.getOrCreateOrderLine(
      ctx,
      order,
      productId
    );

    const newQuantity =
      (existingOrderLine ? existingOrderLine?.quantity : 0) + quantity;

    await this.orderModifier.updateOrderLineQuantity(
      ctx,
      orderLine,
      newQuantity,
      order
    );

    return this.findOne(orderId);
  }

  /**
   * @description
   * Возвращает массив разрешенных способов доставки {@link ShippingMethod} которые могут быть использованы для текущего заказа.
   * Доступность способа доставки может быть определена в {@link ShippingEligibilityChecker}.
   *
   * The quote also includes a price for each method, as determined by the configured
   * {@link ShippingCalculator} of each eligible ShippingMethod.
   */
  public async getEligibleShippingMethods(
    ctx: RequestContext,
    orderId: number
  ): Promise<ShippingMethodQuote[]> {
    const order = await this.getOrderOrThrow(orderId);
    const eligibleMethods: EligibleShippingMethod[] =
      await this.shippingCalculator.getEligibleShippingMethods(ctx, order);

    return eligibleMethods.map((eligible: EligibleShippingMethod) => {
      const { method, result } = eligible;

      return {
        id: method.id,
        price: result.price,
        description: method.description,
        name: method.name,
        code: method.code,
        metadata: result.metadata,
        customFields: eligible.method.customFields,
      };
    });
  }

  /**
   * @description
   * Устанавливает способ доставки в заказе.
   */
  public async setShippingMethod(
    ctx: RequestContext,
    orderId: number,
    shippingMethodId: number
  ): Promise<OrderModificationError | Order> {
    const order = await this.getOrderOrThrow(orderId);
    const validationError = this.assertAddingItemsState(order);

    if (validationError) {
      return validationError;
    }

    const result = await this.orderModifier.setShippingMethod(
      ctx,
      order,
      shippingMethodId
    );

    if (isGraphQlErrorResult(result)) {
      return result;
    }

    const updatedOrder = await this.getOrderOrThrow(orderId);
    await this.orderCalculator.applyPriceAdjustments(ctx, updatedOrder);

    return this.dataSource.getRepository(Order).save(updatedOrder);
  }

  /**
   * @description
   * Устанавливает адрес доставки в заказе.
   */
  public async setShippingAddress(
    ctx: RequestContext,
    orderId: number,
    input: AddressInput
  ): Promise<Order> {
    await this.getOrderOrThrow(orderId);
    await this.dataSource
      .getRepository(Order)
      .update({ id: orderId }, { shippingAddress: input });

    return assertFound(this.findOne(orderId));
  }

  /**
   * @description
   * Связывает покупателя с заказом.
   */
  public async addCustomerToOrder(
    ctx: RequestContext,
    orderIdOrOrder: number | Order,
    customer: Customer
  ): Promise<Order> {
    const order =
      orderIdOrOrder instanceof Order
        ? orderIdOrOrder
        : await this.getOrderOrThrow(orderIdOrOrder);
    order.customer = customer;

    await this.dataSource.getRepository(Order).save(order, { reload: false });
    // let updatedOrder = order;
    // Check that any applied couponCodes are still valid now that
    // we know the Customer.
    // if (order.active && order.couponCodes) {
    //   for (const couponCode of order.couponCodes.slice()) {
    //     const validationResult = await this.promotionService.validateCouponCode(
    //       ctx,
    //       couponCode,
    //       customer.id
    //     );
    //     if (isGraphQlErrorResult(validationResult)) {
    //       updatedOrder = await this.removeCouponCode(ctx, order.id, couponCode);
    //     }
    //   }
    // }
    return order;
  }

  /**
   * @description
   * Добавляет платеж к заказу
   */
  public async addPaymentToOrder(
    ctx: RequestContext,
    orderId: number,
    { method, metadata }: PaymentInput
  ): Promise<OrderPaymentStateError | Order> {
    // Получим заказ из базы данных. Если заказ не существует, возвращаем ошибку
    const order = await this.getOrderOrThrow(orderId);

    // Проверим, можем ли мы добавить платеж в заказа
    if (!this.canAddPaymentToOrder(order)) {
      return new OrderPaymentStateError();
    }

    const amountToPay = order.total;
    const payment = await this.paymentService.createPayment(
      ctx,
      order,
      amountToPay,
      method,
      metadata
    );

    if (isGraphQlErrorResult(payment)) {
      return payment;
    } else if (payment.state === 'Error') {
      return new PaymentFailedError(payment.errorMessage);
    } else if (payment.state === 'Declined') {
      return new PaymentDeclinedError(payment.errorMessage);
    }
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
  ): Promise<UpdateOrderItemsResult | Order> {
    const order = await this.getOrderOrThrow(orderId);
    const orderLine = this.getOrderLineOrThrow(order, orderLineId);
    const validationError: UpdateOrderItemsResult =
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

    const updatedOrder = await this.orderCalculator.applyPriceAdjustments(
      ctx,
      order
    );

    await this.dataSource
      .getRepository(Order)
      // Explicitly omit the shippingAddress and billingAddress properties to avoid
      // a race condition where changing one or the other in parallel can
      // overwrite the other's changes.
      .save(omit(updatedOrder, ['shippingAddress']), {
        reload: false,
      });

    return assertFound(this.findOne(updatedOrder.id));
  }

  public async removeItemFromOrder(
    ctx: RequestContext,
    orderId: number,
    orderLineId: number
  ): Promise<RemoveOrderItemResult | Order> {
    const order = await this.getOrderOrThrow(orderId);
    const validationError = this.assertAddingItemsState(order);

    if (validationError) {
      return validationError;
    }

    const orderLine = this.getOrderLineOrThrow(order, orderLineId);

    order.lines = order.lines.filter(({ id }: OrderLine) => id !== orderLineId);

    await this.dataSource.getRepository(OrderLine).remove(orderLine);
    this.eventBus.publish(new OrderLineEvent(ctx, order, orderLine, 'deleted'));
    return order;
  }

  /**
   * @description
   * Устанавливает заказу указанный статус
   */
  public async transitionToState(
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
    } catch (transitionError: any) {
      return new OrderStateTransitionError(transitionError, fromState, state);
    }

    await finalize();
    await this.dataSource.getRepository(Order).save(order, { reload: false });

    // this.eventBus.publish(
    //   new OrderStateTransitionEvent(fromState, state, ctx, order)
    // );

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
      shippingAddress: {},
      //subTotal: 0,
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
    const allowedStatuses = ['AddingItems', 'Draft', 'Created'];

    return allowedStatuses.includes(order.state)
      ? null
      : new OrderModificationError();
  }
}
