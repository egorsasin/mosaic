import { User } from '../../data';
import { MosaicEvent } from '../event';

export class AccountRegistrationEvent extends MosaicEvent {
  constructor(public user: User) {
    super();
  }
}
