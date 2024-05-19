import { DocumentNode } from 'graphql';

import { InjectableStrategy } from '../../common';
import { User } from '../../data';

export interface AuthenticationStrategy<Data = unknown> extends InjectableStrategy {
  readonly name: string;
  defineInputType(): DocumentNode;
  authenticate(data: Data): Promise<User | false | string>;
  onLogOut?(user: User): Promise<void>;
}
