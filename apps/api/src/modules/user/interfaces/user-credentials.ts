import { UserStatus } from '../../../generated/prisma/enums';

export interface UserCredentials {
  id: string;
  email: string;
  anonName: string;
  passwordHash: string;
  status: UserStatus;
  emailVerified: boolean;
}
