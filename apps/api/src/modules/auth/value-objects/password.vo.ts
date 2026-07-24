import { PasswordInvalidException } from "../../user/exception/password-invalid.exception";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_REGEX = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{${PASSWORD_MIN_LENGTH},${PASSWORD_MAX_LENGTH}}$`,
);

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