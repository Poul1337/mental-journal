import { Module } from '@nestjs/common';

import { AccountCanActGuard } from '../../common/guards/account-can-act.guard';
import { JournalModule } from '../journal/journal.module';
import { UserModule } from '../user/user.module';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [JournalModule, UserModule],
  controllers: [FeedController],
  providers: [FeedService, AccountCanActGuard],
})
export class FeedModule {}
