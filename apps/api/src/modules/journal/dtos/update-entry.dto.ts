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

import {
  ALL_JOURNAL_TAGS,
  JournalTag,
} from '../../../common/consts/tags.const';
import { EntryVisibility } from '../../../generated/prisma/enums';
import {
  MAX_CONTENT_LENGTH,
  MAX_MOOD,
  MIN_CONTENT_LENGTH,
  MIN_MOOD,
} from '../consts/entry.const';

export class UpdateEntryDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_CONTENT_LENGTH)
  @MaxLength(MAX_CONTENT_LENGTH)
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsInt()
  @Min(MIN_MOOD)
  @Max(MAX_MOOD)
  @IsOptional()
  mood?: number;

  @ApiProperty()
  @IsIn(ALL_JOURNAL_TAGS, { each: true })
  @IsOptional()
  tags?: JournalTag[];

  @ApiProperty()
  @IsEnum(EntryVisibility)
  @IsOptional()
  visibility?: EntryVisibility;
}
