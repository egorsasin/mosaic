import { Injector } from '../api/common';

export interface InjectableStrategy {
  init?: (injector: Injector) => void | Promise<void>;
  destroy?: () => void | Promise<void>;
}
