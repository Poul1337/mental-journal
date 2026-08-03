import { Inject, Injectable } from '@nestjs/common';

import { ErrorPath } from '../../common/const/error-path.const';
import { assertAccountCanAct } from '../../common/utils/assert-account-can-act.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import {
  FIND_USER_BY_ID_PORT,
  FindUserByIdPort,
} from './interfaces/find-user-by-id.port';

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject(FIND_USER_BY_ID_PORT)
    private readonly findUserByIdPort: FindUserByIdPort,
  ) {}

  //TODO: createEntry method
  async createEntry(dto: CreateEntryDto, userId: string): Promise<void> {
    const user = await this.findUserByIdPort.execute(userId);

    assertAccountCanAct(user, ErrorPath.JOURNAL);

    const { content, mood, tags, visibility } = dto;

    await this.prisma.journalEntry.create({
      data: {
        userId,
        content,
        mood,
        tags,
        visibility,
      },
    });
  }

  //TODO: userEntriesList method
  async userEntriesList(): Promise<void> {}
  //TODO: singleEntry method

  //TODO: editEntry method
  //TODO: deleteEntry method
}
