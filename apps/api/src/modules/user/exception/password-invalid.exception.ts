import { ErrorPath } from '../../../common/const/error-path.const';
import { DomainException } from '../../../common/exceptions/domain.exception';

export class PasswordInvalidException extends DomainException {
  constructor() {
    super(
      `${ErrorPath.USER}: must be 8–72 chars with upper, lower, digit and special char`,
    );
  }
}
