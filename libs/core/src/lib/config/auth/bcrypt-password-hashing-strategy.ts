import { PasswordHashingStrategy } from './password-hashing-strategy';

const SALT_ROUNDS = 12;

export class BcryptPasswordHashingStrategy implements PasswordHashingStrategy {
  private bcrypt: {
    hash: (plaintext: string, rounds: number) => Promise<string>;
    compare: (plaintext: string, hash: string) => Promise<boolean>;
  };

  hash(plaintext: string): Promise<string> {
    this.getBcrypt();
    return this.bcrypt.hash(plaintext, SALT_ROUNDS);
  }

  check(plaintext: string, hash: string): Promise<boolean> {
    this.getBcrypt();
    return this.bcrypt.compare(plaintext, hash);
  }

  private getBcrypt() {
    if (!this.bcrypt) {
      // The bcrypt lib is lazily loaded so that if we want to run app
      // in an environment that does not support native Node modules
      // (such as an online sandbox like Stackblitz) the bcrypt dependency
      // does not get loaded when linking the source files on startup.
      this.bcrypt = require('bcrypt');
    }
  }
}
