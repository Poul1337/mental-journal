import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateEntryDto } from './dto/create-entry.dto';
import { JournalService } from './journal.service';

@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createEntry(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEntryDto,
  ): Promise<void> {
    return this.journalService.createEntry(dto, user.userId);
  }
}
