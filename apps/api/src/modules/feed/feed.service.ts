import { Inject, Injectable } from '@nestjs/common';

import { ListFeedQueryDto } from './dtos/list-feed-query.dto';
import { ListFeedResponseDto } from './dtos/list-feed-response.dto';
import { FIND_FEED_PORT, FindFeedPort } from './ports/find-feed.port';

@Injectable()
export class FeedService {
  constructor(
    @Inject(FIND_FEED_PORT)
    private readonly findFeedPort: FindFeedPort,
  ) {}

  async feed(dto: ListFeedQueryDto): Promise<ListFeedResponseDto> {
    return await this.findFeedPort.execute(dto);
  }
}
