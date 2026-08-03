import { HttpStatus } from '@nestjs/common';

import { ErrorPath } from '../../../common/const/error-path.const';
import { AppException } from '../../../common/exceptions/app.exception';

export class MailSendFailedException extends AppException {
  constructor() {
    super(`${ErrorPath.MAIL}: Failed to send email`, HttpStatus.BAD_GATEWAY);
  }
}
