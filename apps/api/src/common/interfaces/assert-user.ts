import { UserStatus } from '../../generated/prisma/enums';

export interface AssertUser {
  status: UserStatus;
  emailVerified: boolean;
}
