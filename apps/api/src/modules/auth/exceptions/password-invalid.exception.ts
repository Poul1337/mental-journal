import { ErrorPath } from '../../../common/consts/error-path.const';
import { DomainException } from '../../../common/exceptions/domain.exception';

export class PasswordInvalidException extends DomainException {
  constructor() {
    super(
      `${ErrorPath.AUTH}: must be 8–72 chars with upper, lower, digit and special char`,
    );
  }
}
