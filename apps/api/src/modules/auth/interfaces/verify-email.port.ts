import { VerifyEmailResult } from "../../../common/enums/verify-email-result.enum"

export interface VerifyEmailPort {
    execute(tokenHash: string): Promise<VerifyEmailResult>
}

export const VERIFY_EMAIL_PORT = Symbol("VERIFY_EMAIL_PORT")