import { AnonNameInvalidException } from '../exception/anon-name-invalid.exception';

export const ANON_NAME_MIN_LENGTH = 3;
export const ANON_NAME_MAX_LENGTH = 24;
export const ANON_NAME_REGEX: RegExp = new RegExp(
  `^[a-zA-Z0-9_]{${ANON_NAME_MIN_LENGTH},${ANON_NAME_MAX_LENGTH}}$`,
);

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
