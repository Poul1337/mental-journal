import { Module } from '@nestjs/common';

import { DELETE_ALL_SESSIONS_PORT } from '../auth/interfaces/delete-all-sessions.port';
import { DELETE_SESSION_PORT } from '../auth/interfaces/delete-session.port';
import { FIND_BY_REFRESH_TOKEN_HASH_PORT } from '../auth/interfaces/find-by-refresh-token-hash.port';
import { SAVE_SESSION_PORT } from '../auth/interfaces/save-session.port';
import { DeleteAllSessionsAdapter } from './adapter/delete-all-sessions.adapter';
import { DeleteSessionAdapter } from './adapter/delete-session.adapter';
import { FindByRefreshTokenHashAdapter } from './adapter/find-by-refresh-token-hash.adapter';
import { SaveSessionAdapter } from './adapter/save-session.adapter';
import { SessionService } from './session.service';

@Module({
  providers: [
    SessionService,
    { provide: SAVE_SESSION_PORT, useClass: SaveSessionAdapter },
    { provide: DELETE_SESSION_PORT, useClass: DeleteSessionAdapter },
    { provide: DELETE_ALL_SESSIONS_PORT, useClass: DeleteAllSessionsAdapter },
    {
      provide: FIND_BY_REFRESH_TOKEN_HASH_PORT,
      useClass: FindByRefreshTokenHashAdapter,
    },
  ],
  exports: [
    SAVE_SESSION_PORT,
    DELETE_SESSION_PORT,
    DELETE_ALL_SESSIONS_PORT,
    FIND_BY_REFRESH_TOKEN_HASH_PORT,
  ],
})
export class SessionModule {}
