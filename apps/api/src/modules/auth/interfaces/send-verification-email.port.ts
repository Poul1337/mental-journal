export interface SendVerificationEmailPort {
    execute(to: string, verificationLink: string): Promise<void>
}

export const SEND_VERIFICATION_EMAIL_PORT = Symbol('SEND_VERIFICATION_EMAIL_PORT')