import { Module } from "@nestjs/common";
import { SAVE_SESSION_PORT } from "../auth/interfaces/save-session.port";
import { SaveSessionAdapter } from "./adapter/save-session.adapter";
import { SessionService } from "./session.service";
import { DELETE_SESSION_PORT } from "../auth/interfaces/delete-session.port";
import { DeleteSessionAdapter } from "./adapter/delete-session.adapter";
import { DELETE_ALL_SESSIONS_PORT } from "../auth/interfaces/delete-all-sessions.port";
import { DeleteAllSessionsAdapter } from "./adapter/delete-all-sessions.adapter";

@Module({
    providers: [
        SessionService,
        { provide: SAVE_SESSION_PORT, useClass: SaveSessionAdapter },
        { provide: DELETE_SESSION_PORT, useClass: DeleteSessionAdapter },
        { provide: DELETE_ALL_SESSIONS_PORT, useClass: DeleteAllSessionsAdapter }
    ],
    exports: [SAVE_SESSION_PORT, DELETE_SESSION_PORT, DELETE_ALL_SESSIONS_PORT]
})
export class SessionModule {}