import { UserStatus } from '../../../generated/prisma/enums';

export interface FindUserByEmailInput {
  email: string;
}

export interface FindUserByEmailResult {
  id: string;
  email: string;
  anonName: string;
  passwordHash: string;
  status: UserStatus;
  emailVerified: boolean;
}

export interface FindUserByEmailPort {
  execute(input: FindUserByEmailInput): Promise<FindUserByEmailResult | null>;
}

export const FIND_USER_BY_EMAIL_PORT = Symbol('FIND_USER_BY_EMAIL_PORT');
