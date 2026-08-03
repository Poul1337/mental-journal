import { UserStatus } from '../../../generated/prisma/enums';

export interface FindUserByIdResult {
  id: string;
  status: UserStatus;
  emailVerified: boolean;
}
