import { Injectable } from '@nestjs/common';

import { VerifyEmailResult } from '../../../common/enums/verify-email-result.enum';
import {
  VerifyEmailInput,
  VerifyEmailPort,
} from '../../auth/ports/verify-email.port';
import { UserService } from '../user.service';

@Injectable()
export class VerifyEmailAdapter implements VerifyEmailPort {
  constructor(private readonly userService: UserService) {}

  async execute({ tokenHash }: VerifyEmailInput): Promise<VerifyEmailResult> {
    return await this.userService.verifyEmail(tokenHash);
  }
}
