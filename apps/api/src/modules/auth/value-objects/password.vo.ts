import { PasswordInvalidException } from '../exceptions/password-invalid.exception';
import { PASSWORD_REGEX } from '../consts/password.const';

export class Password {
  private constructor(private readonly value: string) {}

  static create(plain: string): Password {
    const trimmed = plain.trim();

    if (!PASSWORD_REGEX.test(trimmed)) {
      throw new PasswordInvalidException();
    }

    return new Password(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Password): boolean {
    return this.value === other.value;
  }
}
