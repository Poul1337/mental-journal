export interface RegisterUserInput {
  email: string;
  anonName: string;
  passwordHash: string;
  emailVerificationTokenHash: string;
  emailVerificationTokenExpiresAt: Date;
}

export interface RegisterUserResult {
  id: string;
  anonName: string;
}

export interface RegisterUserPort {
  execute(input: RegisterUserInput): Promise<RegisterUserResult>;
}

export const REGISTER_USER_PORT = Symbol('REGISTER_USER_PORT');
