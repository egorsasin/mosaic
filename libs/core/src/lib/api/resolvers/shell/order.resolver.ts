import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  MutationArgs,
  PaymentInput,
  ShippingInput,
  ForbiddenError,
  NoActiveOrderError,
  OrderModificationError,
  OrderPaymentStateError,
  CreateCustomerInput,
  SetCustomerForOrderResult,
  AddressInput,
  QueryOrderByCodeArgs,
} from '@mosaic/common';

import { Allow, Ctx } from '../../decorators';
import { Permission, RequestContext } from '../../common';
import { Order } from '../../../data';
import { ActiveOrderService } from '../../../service/helpers/active-order';
import { OrderService } from '../../../service/services/order.service';
import {
  MutationAddItemToOrderArgs,
  MutationAdjustOrderLineArgs,
  MutationRemoveOrderLineArgs,
  RemoveOrderItemResult,
  UpdateOrderItemsResult,
} from '../../../types';
import { ACTIVE_ORDER_INPUT_FIELD_NAME } from '../../config';
import { ErrorResultUnion, isGraphQlErrorResult } from '../../../common';
import { ConfigService } from '../../../config';

type ActiveOrderArgs = { [ACTIVE_ORDER_INPUT_FIELD_NAME]?: unknown };

@Resolver()
export class OrderResolver {
  constructor(
    private orderService: OrderService,
    private activeOrderService: ActiveOrderService,
    private configService: ConfigService
  ) {}

  @Query()
  @Allow(Permission.Owner)
  async activeOrder(@Ctx() ctx: RequestContext): Promise<Order | undefined> {
    if (ctx.authorizedAsOwnerOnly) {
      const sessionOrder = await this.activeOrderService.getOrderFromContext(
        ctx
      );
      const order = sessionOrder
        ? await this.orderService.findOne(sessionOrder.id)
        : undefined;

      return order;
    }
  }

  @Mutation()
  @Allow(Permission.Owner)
  public async addItemToOrder(
    @Ctx() ctx: RequestContext,
    @Args() { productId, quantity }: MutationAddItemToOrderArgs
  ): Promise<UpdateOrderItemsResult | Order> {
    const order = await this.activeOrderService.getOrderFromContext(ctx, true);

    return this.orderService.addItemToOrder(ctx, order.id, productId, quantity);
  }

  @Query()
  @Allow(Permission.Owner)
  async orderByCode(
    @Ctx() ctx: RequestContext,
    @Args() args: QueryOrderByCodeArgs
  ): Promise<Order | undefined> {
    if (ctx.authorizedAsOwnerOnly) {
      const order = await this.orderService.findOneByCode(args.code);

      if (
        order &&
        (!ctx.activeUserId || order.customer?.user?.id === ctx.activeUserId)
      ) {
        return order;
      }
      // Возвращаем ошибку даже если заказ не существует,
      // чтобы избежать атак с перебором возможных кодов заказов
      throw new ForbiddenError();
    }
  }

  @Mutation()
  @Allow(Permission.Owner)
  public async addPaymentToOrder(
    @Ctx() ctx: RequestContext,
    @Args() { input }: MutationArgs<PaymentInput> & ActiveOrderArgs
  ): Promise<Order | OrderPaymentStateError | NoActiveOrderError> {
    if (ctx.authorizedAsOwnerOnly) {
      const sessionOrder = await this.activeOrderService.getActiveOrder(ctx);

      if (sessionOrder) {
        const order = await this.orderService.addPaymentToOrder(
          ctx,
          sessionOrder.id,
          input
        );
        //   if (isGraphQlErrorResult(order)) {
        //     return order;
        //   }
        //   if (order.active === false) {
        //     await this.customerService.createAddressesForNewCustomer(ctx, order);
        //   }

        //   if (
        //     order.active === false &&
        //     ctx.session?.activeOrderId === sessionOrder.id
        //   ) {
        //     await this.sessionService.unsetActiveOrder(ctx, ctx.session);

        return order;
      }
    }
    return new NoActiveOrderError();
  }

  @Mutation()
  @Allow(Permission.Owner)
  public async adjustOrderLine(
    @Ctx() ctx: RequestContext,
    @Args()
    { orderLineId, quantity }: MutationAdjustOrderLineArgs & ActiveOrderArgs
  ): Promise<UpdateOrderItemsResult | Order> {
    if (quantity === 0) {
      return this.removeOrderLine(ctx, { orderLineId });
    }

    const order = await this.activeOrderService.getActiveOrder(ctx);

    return this.orderService.adjustOrderLine(
      ctx,
      order.id,
      orderLineId,
      quantity
    );
  }

  @Mutation()
  @Allow(Permission.Owner)
  public async removeOrderLine(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationRemoveOrderLineArgs & ActiveOrderArgs
  ): Promise<RemoveOrderItemResult | Order> {
    const order = await this.activeOrderService.getActiveOrder(ctx);
    return this.orderService.removeItemFromOrder(
      ctx,
      order.id,
      args.orderLineId
    );
  }

  @Mutation()
  @Allow(Permission.Owner)
  async setCustomerForOrder(
    @Ctx() ctx: RequestContext,
    @Args() { input }: MutationArgs<CreateCustomerInput> & ActiveOrderArgs
  ): Promise<ErrorResultUnion<SetCustomerForOrderResult, Order>> {
    if (ctx.authorizedAsOwnerOnly) {
      const sessionOrder = await this.activeOrderService.getActiveOrder(ctx);
      if (sessionOrder) {
        const { guestCheckoutStrategy } = this.configService.orderOptions;
        const result = await guestCheckoutStrategy.setCustomerForOrder(
          ctx,
          sessionOrder,
          input
        );
        if (isGraphQlErrorResult(result)) {
          return result;
        }
        return this.orderService.addCustomerToOrder(
          ctx,
          sessionOrder.id,
          result
        );
      }
    }
    return new NoActiveOrderError();
  }

  @Mutation()
  @Allow(Permission.Owner)
  async setOrderShippingMethod(
    @Ctx() ctx: RequestContext,
    @Args() { input }: MutationArgs<ShippingInput> & ActiveOrderArgs
  ): Promise<Order | NoActiveOrderError | OrderModificationError> {
    if (ctx.authorizedAsOwnerOnly) {
      const sessionOrder = await this.activeOrderService.getActiveOrder(ctx);
      if (sessionOrder) {
        const { shippingMethodId, metadata } = input;
        return this.orderService.setShippingMethod(
          ctx,
          sessionOrder.id,
          shippingMethodId,
          metadata
        );
      }
    }
    return new NoActiveOrderError();
  }

  @Mutation()
  @Allow(Permission.Owner)
  async setOrderShippingAddress(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationArgs<AddressInput> & ActiveOrderArgs
  ): Promise<ErrorResultUnion<NoActiveOrderError, Order>> {
    if (ctx.authorizedAsOwnerOnly) {
      const sessionOrder = await this.activeOrderService.getActiveOrder(ctx);
      if (sessionOrder) {
        return this.orderService.setShippingAddress(
          ctx,
          sessionOrder.id,
          args.input
        );
      }
    }
    return new NoActiveOrderError();
  }
}
