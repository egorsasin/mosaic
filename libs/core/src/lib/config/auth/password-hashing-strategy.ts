import { InjectableStrategy } from '../../common';

export interface PasswordHashingStrategy extends InjectableStrategy {
  hash(plaintext: string): Promise<string>;
  check(plaintext: string, hash: string): Promise<boolean>;
}
