export interface VerificationUserCredentials {
    emailVerified: boolean,
    emailVerificationTokenHash: string | null,
    emailVerificationTokenExpiresAt: Date | null
}