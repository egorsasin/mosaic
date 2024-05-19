import { ChildEntity } from 'typeorm';

import { Session, SessionTypes } from './session.entyty';

@ChildEntity(SessionTypes.ANONYMOUS)
export class AnonymousSession extends Session {
  constructor(input?: Partial<AnonymousSession>) {
    super(input);
  }
}
