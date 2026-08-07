import type { JournalEntry } from '../../../generated/prisma/client';
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
}
