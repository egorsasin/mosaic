import { Injector } from '../injector';

export interface InjectableStrategy {
  init?: (injector: Injector) => void | Promise<void>;
  destroy?: () => void | Promise<void>;
}
