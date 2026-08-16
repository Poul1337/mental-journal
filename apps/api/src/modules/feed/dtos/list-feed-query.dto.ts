import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsIn, IsOptional, IsString } from 'class-validator';

import {
  ALL_JOURNAL_TAGS,
  JournalTag,
} from '../../../common/consts/tags.const';

export class ListFeedQueryDto {
  @ApiPropertyOptional({
    isArray: true,
    enum: ALL_JOURNAL_TAGS,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsIn(ALL_JOURNAL_TAGS, { each: true })
  tags?: JournalTag[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastCursorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastCreatedAt?: Date;
}
