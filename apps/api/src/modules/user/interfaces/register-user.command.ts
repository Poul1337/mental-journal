export interface RegisterUserCommand {
    email: string;
    anonName: string;
    passwordHash: string;
    emailVerificationTokenHash: string;
    emailVerificationTokenExpiresAt: Date;
}