import { IssueEmailVerificationResult } from '../../../common/enums/issue-email-verification-result.enum';

export interface IssueEmailVerificationInput {
  email: string;
  tokenHash: string;
  expiresAt: Date | null;
}

export interface IssueEmailVerificationPort {
  execute(
    input: IssueEmailVerificationInput,
  ): Promise<IssueEmailVerificationResult>;
}

export const ISSUE_EMAIL_VERIFICATION_PORT = Symbol(
  'ISSUE_EMAIL_VERIFICATION_PORT',
);
