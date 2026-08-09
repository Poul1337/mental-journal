import { VerifyEmailResult } from '../../../common/enums/verify-email-result.enum';

export interface VerifyEmailInput {
  tokenHash: string;
}

export interface VerifyEmailPort {
  execute(input: VerifyEmailInput): Promise<VerifyEmailResult>;
}

export const VERIFY_EMAIL_PORT = Symbol('VERIFY_EMAIL_PORT');
