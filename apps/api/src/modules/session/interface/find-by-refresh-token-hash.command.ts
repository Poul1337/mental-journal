import { UserStatus } from '../../../generated/prisma/enums';

export interface FindByRefreshTokenHashCommand {
  id: string;
  userId: string;
  expiresAt: Date;
  user: {
    id: string;
    anonName: string;
    status: UserStatus;
    emailVerified: boolean;
  };
}
