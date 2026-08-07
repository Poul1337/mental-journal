import { ApiProperty } from '@nestjs/swagger';

class ListEntriesNextCursorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  mood?: number;
}

class ListEntriesMetaDto {
  @ApiProperty()
  nextCursor!: ListEntriesNextCursorDto | null;

  @ApiProperty()
  hasMore!: boolean;
}

export class EntryItemDto {
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

export class ListEntriesResponseDto {
  @ApiProperty()
  items!: EntryItemDto[];

  @ApiProperty()
  meta!: ListEntriesMetaDto;
}
