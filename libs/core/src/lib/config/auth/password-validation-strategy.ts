import { InjectableStrategy } from '../../common';

export interface PasswordValidationStrategy extends InjectableStrategy {
  validate(password: string): Promise<boolean | string> | boolean | string;
}
