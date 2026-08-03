export interface IssueEmailVerificationInputCommand {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}
