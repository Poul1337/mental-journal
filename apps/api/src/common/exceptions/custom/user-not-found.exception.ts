import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../const/error-path.const';
import { AppException } from '../app.exception';

export class UserNotFoundException extends AppException {
  constructor(path: ErrorPath) {
    super(`${path}: user not found`, HttpStatus.NOT_FOUND);
  }
}
