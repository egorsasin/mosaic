import { CreateCustomerInput } from '@mosaic/common';

import { Customer } from '../../data';
import { RequestContext } from '../../api/common/request-context';
import { MosaicEvent } from '../event';

/**
 * @description
 * Это событие происходит всякий раз когда кастомер {@link Customer}
 * добавлен, изменен или удален
 */
export class CustomerEvent extends MosaicEvent {
  constructor(
    public ctx: RequestContext,
    public entity: Customer,
    public type: 'created' | 'updated' | 'deleted',
    public input?: CreateCustomerInput
  ) {
    super();
  }

  /**
   * Return an customer field to become compatible with the
   * deprecated old version of CustomerEvent
   * @deprecated Use `entity` instead
   * @since 1.4
   */
  get customer(): Customer {
    return this.entity;
  }
}
