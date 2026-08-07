import { UserStatus } from '../../../generated/prisma/enums';

interface FindUserByIdPortResult {
  id: string;
  status: UserStatus;
  emailVerified: boolean;
}

export interface FindUserByIdPort {
  execute(id: string): Promise<FindUserByIdPortResult | null>;
}

export const FIND_USER_BY_ID_PORT = Symbol('FIND_USER_BY_ID_PORT');
