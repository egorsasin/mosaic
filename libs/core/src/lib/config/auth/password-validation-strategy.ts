import { InjectableStrategy } from '@mosaic/core/common';

export interface PasswordValidationStrategy extends InjectableStrategy {
  validate(password: string): Promise<boolean | string> | boolean | string;
}
