import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ErrorPath } from '../../common/consts/error-path.const';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { SetErrorPath } from '../../common/decorators/set-error-path.decorator';
import { AccountCanActGuard } from '../../common/guards/account-can-act.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateEntryDto } from './dtos/create-entry.dto';
import { ListEntriesQueryDto } from './dtos/list-entries-query.dto';
import {
  EntryItemDto,
  ListEntriesResponseDto,
} from './dtos/list-entries-response.dto';
import { UpdateEntryDto } from './dtos/update-entry.dto';
import { JournalService } from './journal.service';

@SetErrorPath(ErrorPath.JOURNAL)
@UseGuards(JwtAuthGuard, AccountCanActGuard)
@Controller('journal')
@ApiTags('Journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEntryDto,
  ): Promise<{ id: string }> {
    return this.journalService.create(dto, user.userId);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() dto: ListEntriesQueryDto,
  ): Promise<ListEntriesResponseDto> {
    return this.journalService.findAll(user.userId, dto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) entryId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<EntryItemDto> {
    return this.journalService.findOne(user.userId, entryId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseUUIDPipe) entryId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateEntryDto,
  ): Promise<{ id: string }> {
    return this.journalService.update(user.userId, entryId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(
    @Param('id', ParseUUIDPipe) entryId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ id: string }> {
    return this.journalService.delete(user.userId, entryId);
  }
}

//TODO: Figure out if is needed to implement java spring boot locations e.g URI location = URI.create("/users/" + user.id());
