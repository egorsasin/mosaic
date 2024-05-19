import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';

import { User } from '../user/user.entity';

import { Session, SessionTypes } from './session.entyty';

@ChildEntity(SessionTypes.AUTHENTICATED)
export class AuthenticatedSession extends Session {
  constructor(input?: Partial<AuthenticatedSession>) {
    super(input);
  }

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'authentication_strategy' })
  authenticationStrategy: string;
}
