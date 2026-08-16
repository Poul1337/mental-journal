import { ApiProperty } from '@nestjs/swagger';

class ListFeedNextCursorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;
}

class ListFeedMetaDto {
  @ApiProperty({ nullable: true, type: ListFeedNextCursorDto })
  nextCursor!: ListFeedNextCursorDto | null;

  @ApiProperty()
  hasMore!: boolean;
}

export class FeedItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty()
  mood?: number;

  @ApiProperty()
  tags!: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date | null;
}

export class ListFeedResponseDto {
  @ApiProperty()
  items!: FeedItemDto[];

  @ApiProperty()
  meta!: ListFeedMetaDto;
}
