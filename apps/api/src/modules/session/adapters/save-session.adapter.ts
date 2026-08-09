import { Injectable } from '@nestjs/common';

import {
  SaveSessionInput,
  SaveSessionPort,
} from '../../auth/ports/save-session.port';
import { SessionService } from '../session.service';

@Injectable()
export class SaveSessionAdapter implements SaveSessionPort {
  constructor(private readonly sessionService: SessionService) {}

  async execute(input: SaveSessionInput): Promise<void> {
    await this.sessionService.saveSession(input);
  }
}
