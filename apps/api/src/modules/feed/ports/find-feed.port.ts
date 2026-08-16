import { JournalTag } from '../../../common/consts/tags.const';

export interface FindFeedInput {
  tags?: JournalTag[];
  lastCursorId?: string;
  lastCreatedAt?: Date;
}

export interface FeedItem {
  id: string;
  content: string;
  mood?: number;
  tags: JournalTag[];
  createdAt: Date;
  updatedAt: Date | null;
}

interface ListFeedNextCursor {
  id: string;
  createdAt: Date;
}

interface ListFeedMeta {
  nextCursor: ListFeedNextCursor | null;
  hasMore: boolean;
}

export interface FindFeedResult {
  items: FeedItem[];
  meta: ListFeedMeta;
}

export interface FindFeedPort {
  execute(input: FindFeedInput): Promise<FindFeedResult>;
}

export const FIND_FEED_PORT = Symbol('FIND_FEED_PORT');
