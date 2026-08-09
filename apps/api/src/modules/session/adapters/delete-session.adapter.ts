import { Injectable } from '@nestjs/common';

import {
  DeleteSessionInput,
  DeleteSessionPort,
} from '../../auth/ports/delete-session.port';
import { SessionService } from '../session.service';

@Injectable()
export class DeleteSessionAdapter implements DeleteSessionPort {
  constructor(private readonly sessionService: SessionService) {}

  async execute({ refreshTokenHash }: DeleteSessionInput): Promise<void> {
    await this.sessionService.deleteSession(refreshTokenHash);
  }
}
