import { Module } from '@nestjs/common';

import { AccountCanActGuard } from '../../common/guards/account-can-act.guard';
import { UserModule } from '../user/user.module';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';

@Module({
  imports: [UserModule],
  providers: [JournalService, AccountCanActGuard],
  controllers: [JournalController],
})
export class JournalModule {}
