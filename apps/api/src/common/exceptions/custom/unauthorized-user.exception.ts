import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../consts/error-path.const';
import { AppException } from '../app.exception';

export class UnauthorizedUserException extends AppException {
  constructor(path: ErrorPath) {
    super(`${path}: user unauthorized`, HttpStatus.UNAUTHORIZED);
  }
}
