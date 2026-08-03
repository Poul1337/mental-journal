import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { EntryVisibility } from '../../../generated/prisma/enums';
import { ALL_JOURNAL_TAGS, JournalTag } from '../consts/tags.const';

const MIN_CONTENT_LENGTH = 1;
const MAX_CONTENT_LENGTH = 10_000;

export class CreateEntryDto {
  @ApiProperty({ example: 'Today I feel ...' })
  @IsString()
  @MinLength(MIN_CONTENT_LENGTH)
  @MaxLength(MAX_CONTENT_LENGTH)
  content!: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  mood!: number;

  @ApiProperty({ example: ['therapy'] })
  @IsIn(ALL_JOURNAL_TAGS, { each: true })
  @IsOptional()
  tags!: JournalTag[];

  @ApiProperty({ example: EntryVisibility.PRIVATE })
  @IsEnum(EntryVisibility)
  visibility!: EntryVisibility;
}
