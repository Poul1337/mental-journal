import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../../common/consts/error-path.const';
import { AppException } from '../../../common/exceptions/app.exception';

export class InvalidCredentialsException extends AppException {
  constructor() {
    super(
      `${ErrorPath.AUTH}: Invalid email or password`,
      HttpStatus.UNAUTHORIZED,
    );
  }
}
