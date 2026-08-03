import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';

@Module({
  imports: [UserModule],
  providers: [JournalService],
  controllers: [JournalController],
})
export class JournalModule {}
