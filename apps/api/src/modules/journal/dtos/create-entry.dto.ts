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
import {
  MAX_CONTENT_LENGTH,
  MAX_MOOD,
  MIN_CONTENT_LENGTH,
  MIN_MOOD,
} from '../consts/entry.const';
import { ALL_JOURNAL_TAGS, JournalTag } from '../consts/tags.const';

export class CreateEntryDto {
  @ApiProperty({ example: 'Today I feel ...' })
  @IsString()
  @MinLength(MIN_CONTENT_LENGTH)
  @MaxLength(MAX_CONTENT_LENGTH)
  content!: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @IsOptional()
  @Min(MIN_MOOD)
  @Max(MAX_MOOD)
  mood!: number;

  @ApiProperty({ example: ['therapy'] })
  @IsIn(ALL_JOURNAL_TAGS, { each: true })
  @IsOptional()
  tags!: JournalTag[];

  @ApiProperty({ example: EntryVisibility.PRIVATE })
  @IsEnum(EntryVisibility)
  visibility!: EntryVisibility;
}
