import { Module } from '@nestjs/common';

import { DELETE_ALL_SESSIONS_PORT } from '../auth/ports/delete-all-sessions.port';
import { DELETE_SESSION_PORT } from '../auth/ports/delete-session.port';
import { FIND_BY_REFRESH_TOKEN_HASH_PORT } from '../auth/ports/find-by-refresh-token-hash.port';
import { SAVE_SESSION_PORT } from '../auth/ports/save-session.port';
import { UPDATE_SESSION_PORT } from '../auth/ports/update-session.port';
import { DeleteAllSessionsAdapter } from './adapters/delete-all-sessions.adapter';
import { DeleteSessionAdapter } from './adapters/delete-session.adapter';
import { FindByRefreshTokenHashAdapter } from './adapters/find-by-refresh-token-hash.adapter';
import { SaveSessionAdapter } from './adapters/save-session.adapter';
import { UpdateSessionAdapter } from './adapters/update-session.adapter';
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
    { provide: UPDATE_SESSION_PORT, useClass: UpdateSessionAdapter },
  ],
  exports: [
    SAVE_SESSION_PORT,
    DELETE_SESSION_PORT,
    DELETE_ALL_SESSIONS_PORT,
    FIND_BY_REFRESH_TOKEN_HASH_PORT,
    UPDATE_SESSION_PORT,
  ],
})
export class SessionModule {}
