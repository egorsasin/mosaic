import { DocumentNode } from 'graphql';

import { InjectableStrategy } from '../../common';
import { User } from '../../data';
import { RequestContext } from '../../api';

export interface AuthenticationStrategy<Data = unknown>
  extends InjectableStrategy {
  readonly name: string;
  defineInputType(): DocumentNode;
  authenticate(ctx: RequestContext, data: Data): Promise<User | false | string>;
  onLogOut?(user: User): Promise<void>;
}
