import { Injectable } from '@nestjs/common';

import {
  FindByRefreshTokenHashInput,
  FindByRefreshTokenHashPort,
  FindByRefreshTokenHashResult,
} from '../../auth/ports/find-by-refresh-token-hash.port';
import { SessionService } from '../session.service';

@Injectable()
export class FindByRefreshTokenHashAdapter
  implements FindByRefreshTokenHashPort
{
  constructor(private readonly sessionService: SessionService) {}

  async execute({
    refreshTokenHash,
  }: FindByRefreshTokenHashInput): Promise<FindByRefreshTokenHashResult | null> {
    return await this.sessionService.findByRefreshTokenHash(refreshTokenHash);
  }
}
