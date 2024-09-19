import { RequestContext } from '../../api/common/request-context';
import { MosaicEvent } from '../event';

/**
 * @description
 * This event is fired when a user logs out via the shop or admin API `logout` mutation.
 */
export class LogoutEvent extends MosaicEvent {
  constructor(public ctx: RequestContext) {
    super();
  }
}
