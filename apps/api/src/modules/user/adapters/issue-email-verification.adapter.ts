import { Injectable } from '@nestjs/common';

import { IssueEmailVerificationResult } from '../../../common/enums/issue-email-verification-result.enum';
import {
  IssueEmailVerificationInput,
  IssueEmailVerificationPort,
} from '../../auth/ports/issue-email-verification.port';
import { UserService } from '../user.service';

@Injectable()
export class IssueEmailVerificationAdapter implements IssueEmailVerificationPort {
  constructor(private readonly userService: UserService) {}

  async execute(
    input: IssueEmailVerificationInput,
  ): Promise<IssueEmailVerificationResult> {
    return await this.userService.issueEmailVerification(input);
  }
}
