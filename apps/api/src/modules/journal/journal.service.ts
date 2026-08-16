import { Injectable } from '@nestjs/common';

import { EntryStatus, EntryVisibility } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { FindFeedInput, FindFeedResult } from '../feed/ports/find-feed.port';
import { ENTRIES_LIST_TAKE } from './consts/entry.const';
import { CreateEntryDto } from './dtos/create-entry.dto';
import { ListEntriesQueryDto } from './dtos/list-entries-query.dto';
import {
  EntryItemDto,
  ListEntriesResponseDto,
} from './dtos/list-entries-response.dto';
import { UpdateEntryDto } from './dtos/update-entry.dto';
import { EntryNotFoundException } from './exceptions/entry-not-found.exception';
import { Entry, JournalMapper } from './mappers/journal.mapper';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEntryDto, userId: string): Promise<{ id: string }> {
    const { content, mood, tags, visibility } = dto;

    const { id } = await this.prisma.journalEntry.create({
      data: {
        userId,
        content,
        mood,
        tags,
        visibility,
      },
    });

    return { id };
  }

  async findAll(
    userId: string,
    dto: ListEntriesQueryDto,
  ): Promise<ListEntriesResponseDto> {
    const {
      lastCursorId,
      lastCreatedAt,
      visibility,
      lastMood,
      orderBy = 'desc',
      sortBy,
    } = dto;

    const ascending = orderBy === 'asc';

    const entries = await this.prisma.journalEntry.findMany({
      take: ENTRIES_LIST_TAKE + 1,

      where: {
        userId,

        status: EntryStatus.ACTIVE,

        deletedAt: null,

        ...(visibility ? { visibility: visibility } : {}),
        ...(sortBy !== 'mood' && lastCursorId && lastCreatedAt
          ? {
              OR: ascending
                ? [
                    { createdAt: { gt: lastCreatedAt } },
                    { createdAt: lastCreatedAt, id: { gt: lastCursorId } },
                  ]
                : [
                    { createdAt: { lt: lastCreatedAt } },
                    { createdAt: lastCreatedAt, id: { lt: lastCursorId } },
                  ],
            }
          : sortBy === 'mood' && lastCursorId && lastMood != null
            ? {
                OR: ascending
                  ? [
                      { mood: { gt: lastMood } },
                      { mood: lastMood, id: { gt: lastCursorId } },
                    ]
                  : [
                      { mood: { lt: lastMood } },
                      { mood: lastMood, id: { lt: lastCursorId } },
                    ],
              }
            : {}),
      },

      orderBy:
        sortBy === 'mood'
          ? [{ mood: orderBy }, { id: orderBy }]
          : [{ createdAt: orderBy }, { id: orderBy }],
    });

    const hasMore = entries.length > ENTRIES_LIST_TAKE;
    const page = hasMore ? entries.slice(0, ENTRIES_LIST_TAKE) : entries;
    const last = page[page.length - 1];

    return {
      items: page.map(JournalMapper.toEntryItemDto),
      meta: {
        hasMore,
        nextCursor:
          !hasMore || !last
            ? null
            : sortBy === 'mood'
              ? { id: last.id, mood: last.mood ?? undefined }
              : { id: last.id, createdAt: last.createdAt },
      },
    };
  }

  async findOne(userId: string, entryId: string): Promise<EntryItemDto> {
    const entry = await this.assertEntryExists(entryId, userId);

    return JournalMapper.toEntryItemDto(entry);
  }

  async update(
    userId: string,
    entryId: string,
    dto: UpdateEntryDto,
  ): Promise<{ id: string }> {
    await this.assertEntryExists(entryId, userId);

    const { content, mood, tags, visibility } = dto;

    const { id } = await this.prisma.journalEntry.update({
      where: { id: entryId },

      data: {
        ...(content !== undefined ? { content } : {}),
        ...(mood !== undefined ? { mood } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(visibility !== undefined ? { visibility } : {}),
      },

      select: {
        id: true,
      },
    });

    return { id };
  }

  async delete(userId: string, entryId: string): Promise<{ id: string }> {
    await this.assertEntryExists(entryId, userId);

    const { id } = await this.prisma.journalEntry.update({
      where: { id: entryId },

      data: {
        deletedAt: new Date(),
      },

      select: {
        id: true,
      },
    });

    return { id };
  }

  async feed(dto: FindFeedInput): Promise<FindFeedResult> {
    const { lastCreatedAt, lastCursorId, tags } = dto;

    const feed = await this.prisma.journalEntry.findMany({
      where: {
        visibility: EntryVisibility.PUBLIC,
        status: EntryStatus.ACTIVE,
        deletedAt: null,
        ...(tags?.length ? { tags: { hasSome: tags } } : {}),
        ...(lastCursorId && lastCreatedAt
          ? {
              OR: [
                { createdAt: { lt: lastCreatedAt } },
                { createdAt: lastCreatedAt, id: { lt: lastCursorId } },
              ],
            }
          : {}),
      },
      take: ENTRIES_LIST_TAKE + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = feed.length > ENTRIES_LIST_TAKE;
    const page = hasMore ? feed.slice(0, ENTRIES_LIST_TAKE) : feed;
    const last = page[page.length - 1];

    return {
      items: page.map(JournalMapper.toFeedItem),
      meta: {
        hasMore,
        nextCursor:
          !hasMore || !last ? null : { id: last.id, createdAt: last.createdAt },
      },
    };
  }

  private async assertEntryExists(
    entryId: string,
    userId: string,
  ): Promise<Entry> {
    const existing = await this.prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId,
        status: EntryStatus.ACTIVE,
        deletedAt: null,
      },
    });

    if (!existing) throw new EntryNotFoundException();

    return existing;
  }
}
