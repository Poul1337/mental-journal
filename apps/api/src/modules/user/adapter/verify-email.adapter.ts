import { Injectable } from '@nestjs/common';

import { VerifyEmailResult } from '../../../common/enums/verify-email-result.enum';
import { VerifyEmailPort } from '../../auth/interfaces/verify-email.port';
import { UserService } from '../user.service';

@Injectable()
export class VerifyEmailAdapter implements VerifyEmailPort {
  constructor(private readonly userService: UserService) {}

  async execute(tokenHash: string): Promise<VerifyEmailResult> {
    const result = await this.userService.verifyEmail(tokenHash);

    return result;
  }
}
