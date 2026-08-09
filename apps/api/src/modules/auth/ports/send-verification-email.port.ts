export interface SendVerificationEmailInput {
  to: string;
  verificationLink: string
}

export interface SendVerificationEmailPort {
  execute(input: SendVerificationEmailInput): Promise<void>;
}

export const SEND_VERIFICATION_EMAIL_PORT = Symbol(
  'SEND_VERIFICATION_EMAIL_PORT',
);
