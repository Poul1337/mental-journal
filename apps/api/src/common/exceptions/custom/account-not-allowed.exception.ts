import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../const/error-path.const';
import { AppException } from '../app.exception';

export class AccountNotAllowedException extends AppException {
  constructor(path: ErrorPath) {
    super(`${path}: account is not allowed`, HttpStatus.FORBIDDEN);
  }
}
