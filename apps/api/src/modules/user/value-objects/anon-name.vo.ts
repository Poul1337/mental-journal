import { ANON_NAME_REGEX } from '../consts/anon-name.const';
import { AnonNameInvalidException } from '../exceptions/anon-name-invalid.exception';

export class AnonName {
  private constructor(private readonly value: string) {}

  static create(plain: string): AnonName {
    const trimmed = plain.trim();

    if (!ANON_NAME_REGEX.test(trimmed)) {
      throw new AnonNameInvalidException();
    }

    return new AnonName(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AnonName): boolean {
    return this.value === other.value;
  }
}
