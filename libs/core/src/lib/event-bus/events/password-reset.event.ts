import { User } from '../../data';

import { MosaicEvent } from '../event';

export class PasswordResetEvent extends MosaicEvent {
  constructor(public user: User) {
    super();
  }
}
