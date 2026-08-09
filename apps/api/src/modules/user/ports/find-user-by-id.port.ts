import { UserStatus } from '../../../generated/prisma/enums';

export interface FindUserByIdResult {
  id: string;
  status: UserStatus;
  emailVerified: boolean;
}

export interface FindUserByIdPort {
  execute(id: string): Promise<FindUserByIdResult | null>;
}

export const FIND_USER_BY_ID_PORT = Symbol('FIND_USER_BY_ID_PORT');
