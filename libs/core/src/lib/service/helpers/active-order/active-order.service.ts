import { Injectable } from '@nestjs/common';

import { Order } from '../../../data';
import { InternalServerError } from '../../../common';
import { RequestContext } from '../../../api/common/request-context';
import { SessionService } from '../../services/session.service';
import { OrderService } from '../../services/order.service';

/**
 * @description
 * Этот класс используется для получения ссылки на активный ордер из контекста (RequestContext).
 */
@Injectable()
export class ActiveOrderService {
  constructor(
    private orderService: OrderService,
    private sessionService: SessionService
  ) {}

  /**
   * @description
   * Получает активный ордер из текущей сессии.
   * Опционально может быть создан новый ордер если активный ордер не существует
   */
  public async getOrderFromContext(
    ctx: RequestContext
  ): Promise<Order | undefined>;
  public async getOrderFromContext(
    ctx: RequestContext,
    createIfNotExists: true
  ): Promise<Order>;
  async getOrderFromContext(
    ctx: RequestContext,
    createIfNotExists = false
  ): Promise<Order | undefined> {
    let order: Order = ctx.session.activeOrderId
      ? await this.orderService.findActiveOrderById(ctx.session.activeOrderId)
      : null;

    if (!order && ctx.activeUserId) {
      order = await this.orderService.getActiveOrderForUser(ctx.activeUserId);
    }

    if (!order) {
      order = createIfNotExists
        ? await this.orderService.create(ctx.activeUserId)
        : null;

      if (order && ctx.session) {
        await this.sessionService.setActiveOrder(ctx.session, order);
      }
    }

    return order || undefined;
  }

  public async getActiveOrder(ctx: RequestContext): Promise<Order | undefined> {
    return await this.determineActiveOrder(ctx);
  }

  private async determineActiveOrder(ctx: RequestContext) {
    if (!ctx.session) {
      throw new InternalServerError('NO_ACTIVE_SESSION');
    }

    let order = ctx.session?.activeOrderId
      ? await this.orderService.findActiveOrderById(ctx.session.activeOrderId)
      : undefined;

    if (!order) {
      if (ctx.activeUserId) {
        order = await this.orderService.getActiveOrderForUser(ctx.activeUserId);
      }
    }
    return order;
  }
}
