import { PasswordValidationStrategy } from './password-validation-strategy';

export class DefaultPasswordValidationStrategy implements PasswordValidationStrategy {
  constructor(private options: { minLength?: number; regexp?: RegExp }) {}

  public validate(password: string): boolean | string {
    const { minLength, regexp } = this.options;
    if (minLength != null) {
      if (password.length < minLength) {
        return false;
      }
    }
    if (regexp != null) {
      if (!regexp.test(password)) {
        return false;
      }
    }
    return true;
  }
}
