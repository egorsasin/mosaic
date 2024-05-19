import { ChildEntity, Column } from 'typeorm';

import { AuthenticationMethod, AuthenticationMethods } from './authentication-method.entity';

@ChildEntity(AuthenticationMethods.External)
export class ExternalAuthenticationMethod extends AuthenticationMethod {
  constructor(input?: Partial<ExternalAuthenticationMethod>) {
    super(input);
  }

  @Column()
  strategy: string;

  @Column({ name: 'external_identifier' })
  externalIdentifier: string;

  @Column('simple-json')
  metadata: any;
}
