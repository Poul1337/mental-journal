import { Injectable } from '@nestjs/common';

import {
  FindFeedInput,
  FindFeedPort,
  FindFeedResult,
} from '../../feed/ports/find-feed.port';
import { JournalService } from '../journal.service';

@Injectable()
export class FindFeedAdapter implements FindFeedPort {
  constructor(private readonly journalService: JournalService) {}

  async execute(input: FindFeedInput): Promise<FindFeedResult> {
    return await this.journalService.feed(input);
  }
}
