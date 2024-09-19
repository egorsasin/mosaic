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

  public getNativeAuthenticationMethod(): NativeAuthenticationMethod;
  public getNativeAuthenticationMethod(
    strict?: boolean
  ): NativeAuthenticationMethod | undefined;
  public getNativeAuthenticationMethod(
    strict?: boolean
  ): NativeAuthenticationMethod | undefined {
    if (!this.authenticationMethods) {
      throw new InternalServerErrorException(
        'User authentication methods not loaded'
      );
    }
    const match = this.authenticationMethods.find(
      (m): m is NativeAuthenticationMethod =>
        m instanceof NativeAuthenticationMethod
    );
    if (!match && (strict === undefined || strict)) {
      throw new InternalServerErrorException(
        'User authentication methods not found'
      );
    }

    return match;
  }
}
