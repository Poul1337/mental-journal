import {
  ALL_JOURNAL_TAGS,
  JournalTag,
} from '../../../common/consts/tags.const';
import type { JournalEntry } from '../../../generated/prisma/client';
import { FeedItem } from '../../feed/ports/find-feed.port';
import { EntryItemDto } from '../dtos/list-entries-response.dto';

export type Entry = JournalEntry;

export class JournalMapper {
  static toEntryItemDto(entry: Entry): EntryItemDto {
    return {
      id: entry.id,
      content: entry.content,
      mood: entry.mood ?? undefined,
      tags: entry.tags,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  static toFeedItem(entry: Entry): FeedItem {
    return {
      id: entry.id,
      content: entry.content,
      mood: entry.mood ?? undefined,
      tags: entry.tags.filter((t): t is JournalTag =>
        (ALL_JOURNAL_TAGS as readonly string[]).includes(t),
      ),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}
