import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../../common/const/error-path.const';
import { AppException } from '../../../common/exceptions/app.exception';

export class UserAlreadyExistsException extends AppException {
  constructor() {
    super(`${ErrorPath.USER}: User already exists`, HttpStatus.CONFLICT);
  }
}
