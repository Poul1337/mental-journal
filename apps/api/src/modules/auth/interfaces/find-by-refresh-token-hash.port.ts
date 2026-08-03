import { UserStatus } from '../../../generated/prisma/enums';

export interface FindByRefreshTokenHashResult {
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

export interface FindByRefreshTokenHashPort {
  execute(
    refreshTokenHash: string,
  ): Promise<FindByRefreshTokenHashResult | null>;
}

export const FIND_BY_REFRESH_TOKEN_HASH_PORT = Symbol(
  'FIND_BY_REFRESH_TOKEN_HASH_PORT',
);
