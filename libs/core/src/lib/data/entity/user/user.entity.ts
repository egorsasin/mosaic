import { InternalServerErrorException } from '@nestjs/common';
import { Column, Entity, OneToMany } from 'typeorm';

import {
  AuthenticationMethod,
  NativeAuthenticationMethod,
} from '../authentication';
import { MosaicEntity, SoftDeletable } from '../entity';

@Entity()
export class User extends MosaicEntity implements SoftDeletable {
  constructor(input?: Partial<User>) {
    super(input);
  }

  @Column()
  public identifier: string;

  @Column({ default: false })
  public verified: boolean;

  @Column({ name: 'deleted_at', type: Date, nullable: true })
  public deletedAt: Date | null;

  @OneToMany(
    () => AuthenticationMethod,
    (method: AuthenticationMethod) => method.user
  )
  public authenticationMethods: AuthenticationMethod[];

  public getNativeAuthenticationMethod(): NativeAuthenticationMethod {
    if (!this.authenticationMethods) {
      throw new InternalServerErrorException(
        'User authentication methods not loaded'
      );
    }
    const match = this.authenticationMethods.find(
      (m): m is NativeAuthenticationMethod =>
        m instanceof NativeAuthenticationMethod
    );
    if (!match) {
      throw new InternalServerErrorException(
        'User authentication methods not found'
      );
    }

    return match;
  }
}
