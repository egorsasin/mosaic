import { ChildEntity, Column } from 'typeorm';

import { AuthenticationMethod, AuthenticationMethods } from './authentication-method.entity';

@ChildEntity(AuthenticationMethods.Native)
export class NativeAuthenticationMethod extends AuthenticationMethod {
  constructor(input?: Partial<NativeAuthenticationMethod>) {
    super(input);
  }

  @Column()
  public identifier: string;

  @Column({ name: 'password_hash', select: false }) passwordHash: string;

  @Column({ name: 'verification_token', type: 'varchar', nullable: true })
  public verificationToken: string | null;

  @Column({ name: 'password_reset_token', type: 'varchar', nullable: true })
  public passwordResetToken: string | null;

  @Column({ name: 'password_reset_token_expiration', type: Date, nullable: true })
  public passwordResetTokenExpiration: Date | null;
}
