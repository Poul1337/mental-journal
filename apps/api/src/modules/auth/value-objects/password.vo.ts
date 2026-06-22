import { PasswordInvalidException } from "../exception/password-invalid.exception";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,72}$/;

export class Password {

  private constructor(private readonly value: string) {}

  static create(plain: string): Password {
    const trimmed = plain.trim();
    if (!PASSWORD_REGEX.test(trimmed)) {
      throw new PasswordInvalidException()
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