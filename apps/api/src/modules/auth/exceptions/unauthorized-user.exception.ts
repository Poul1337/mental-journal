import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../../common/const/error-path.const';
import { AppException } from '../../../common/exceptions/app.exception';

export class UnauthorizedUserException extends AppException {
  constructor() {
    super(`${ErrorPath.AUTH}: user unauthorized`, HttpStatus.UNAUTHORIZED);
  }
}
