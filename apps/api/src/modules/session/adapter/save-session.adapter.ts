import { Injectable } from '@nestjs/common';
import { SaveSessionPort } from './../../auth/interfaces/save-session.port';
import { SessionService } from '../session.service';

@Injectable()
export class SaveSessionAdapter implements SaveSessionPort {

    constructor(private readonly sessionService: SessionService) {}

    async execute(userId: string, refreshTokenHash: string, expiresAt: Date): Promise<void> {
        await this.sessionService.saveSession(userId, refreshTokenHash, expiresAt)
    }
}