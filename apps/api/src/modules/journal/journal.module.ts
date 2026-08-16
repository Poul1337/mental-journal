import { Module } from '@nestjs/common';

import { AccountCanActGuard } from '../../common/guards/account-can-act.guard';
import { FIND_FEED_PORT } from '../feed/ports/find-feed.port';
import { UserModule } from '../user/user.module';
import { FindFeedAdapter } from './adapters/find-feed.adapter';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';

@Module({
  imports: [UserModule],
  providers: [
    JournalService,
    AccountCanActGuard,
    { provide: FIND_FEED_PORT, useClass: FindFeedAdapter },
  ],
  controllers: [JournalController],
  exports: [FIND_FEED_PORT],
})
export class JournalModule {}
