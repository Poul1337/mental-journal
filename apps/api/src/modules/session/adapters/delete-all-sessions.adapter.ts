import { Injectable } from '@nestjs/common';

import {
  DeleteAllSessionsInput,
  DeleteAllSessionsPort,
} from '../../auth/ports/delete-all-sessions.port';
import { SessionService } from '../session.service';

@Injectable()
export class DeleteAllSessionsAdapter implements DeleteAllSessionsPort {
  constructor(private readonly sessionService: SessionService) {}

  async execute({ userId }: DeleteAllSessionsInput): Promise<void> {
    await this.sessionService.deleteAllSessions(userId);
  }
}
