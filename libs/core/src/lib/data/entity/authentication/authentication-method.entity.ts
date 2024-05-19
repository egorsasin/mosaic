import { Column, Entity, JoinColumn, ManyToOne, TableInheritance } from 'typeorm';

import { MosaicEntity } from '../entity';
import { User } from '../user/user.entity';

export enum AuthenticationMethods {
  Native = 'native',
  External = 'external',
}

@Entity()
@TableInheritance({
  column: { name: 'type' },
})
export abstract class AuthenticationMethod extends MosaicEntity {
  @ManyToOne(() => User, (user) => user.authenticationMethods)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AuthenticationMethods,
  })
  readonly type: AuthenticationMethods;
}
