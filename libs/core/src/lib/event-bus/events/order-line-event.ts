import { Order, OrderLine } from '../../data';
import { RequestContext } from '../../api/common/request-context';
import { MosaicEvent } from '../event';

/**
 * @description
 * Это событие происходит всякий раз когда строка ордера {@link OrderLine}
 * добавлена, изменена или удалена
 */
export class OrderLineEvent extends MosaicEvent {
  constructor(
    public ctx: RequestContext,
    public order: Order,
    public orderLine: OrderLine,
    public type: 'created' | 'updated' | 'deleted'
  ) {
    super();
  }
}
