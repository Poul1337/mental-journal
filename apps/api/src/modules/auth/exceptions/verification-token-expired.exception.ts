import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../../common/const/error-path.const';
import { AppException } from '../../../common/exceptions/app.exception';

export class VerificationTokenExpiredException extends AppException {
  constructor() {
    super(
      `${ErrorPath.AUTH}: verification token expired`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
