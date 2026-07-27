import { Injectable } from "@nestjs/common";
import { DeleteSessionPort } from "../../auth/interfaces/delete-session.port";
import { SessionService } from "../session.service";

@Injectable()
export class DeleteSessionAdapter implements DeleteSessionPort {

    constructor(private readonly sessionService: SessionService) {}

    async execute(refreshTokenHash: string): Promise<void> {
        await this.sessionService.deleteSession(refreshTokenHash);
    }
}