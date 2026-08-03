import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../../common/const/error-path.const';
import { AppException } from '../../../common/exceptions/app.exception';

export class VerificationTokenNotFoundException extends AppException {
  constructor() {
    super(
      `${ErrorPath.AUTH}: verification token not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}
