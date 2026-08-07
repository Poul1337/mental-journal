import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../../common/const/error-path.const';
import { AppException } from '../../../common/exceptions/app.exception';

export class EntryNotFoundException extends AppException {
  constructor() {
    super(`${ErrorPath.JOURNAL}: entry not found`, HttpStatus.NOT_FOUND);
  }
}
