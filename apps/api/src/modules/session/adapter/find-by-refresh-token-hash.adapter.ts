import { Injectable } from '@nestjs/common';

import { FindByRefreshTokenHashPort } from '../../auth/interfaces/find-by-refresh-token-hash.port';
import { FindByRefreshTokenHashCommand } from '../interface/find-by-refresh-token-hash.command';
import { SessionService } from '../session.service';

@Injectable()
export class FindByRefreshTokenHashAdapter implements FindByRefreshTokenHashPort {
  constructor(private readonly sessionService: SessionService) {}

  async execute(
    refreshTokenHash: string,
  ): Promise<FindByRefreshTokenHashCommand | null> {
    return await this.sessionService.findByRefreshTokenHash(refreshTokenHash);
  }
}
