import { ErrorPath } from '../../../common/consts/error-path.const';
import { DomainException } from '../../../common/exceptions/domain.exception';

export class AnonNameInvalidException extends DomainException {
  constructor() {
    super(
      `${ErrorPath.USER}: must be 3–24 chars with letters, digits or underscore`,
    );
  }
}
