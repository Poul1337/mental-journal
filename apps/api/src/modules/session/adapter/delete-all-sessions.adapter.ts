import { SessionService } from './../session.service';
import { Injectable } from "@nestjs/common";
import { DeleteAllSessionsPort } from "../../auth/interfaces/delete-all-sessions.port";

@Injectable()
export class DeleteAllSessionsAdapter implements DeleteAllSessionsPort {

    constructor(private readonly sessionService: SessionService) {}

    async execute(userId: string): Promise<void> {
        await this.sessionService.deleteAllSessions(userId)
    }
}