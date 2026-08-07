import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { EntryVisibility } from '../../../generated/prisma/enums';
import { MAX_MOOD, MIN_MOOD } from '../consts/entry.const';

const ORDER_BY = ['asc', 'desc'] as const;
export type OrderBy = (typeof ORDER_BY)[number];

const SORT_BY = ['date', 'mood'] as const;
export type SortBy = (typeof SORT_BY)[number];

export class ListEntriesQueryDto {
  @ApiProperty({ required: false })
  @IsIn(SORT_BY)
  @IsOptional()
  sortBy?: SortBy;

  @ApiProperty({ required: false })
  @IsIn(ORDER_BY)
  @IsOptional()
  orderBy?: OrderBy;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastCursorId?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastCreatedAt?: Date;

  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  @Min(MIN_MOOD)
  @Max(MAX_MOOD)
  @IsOptional()
  lastMood?: number;

  @ApiProperty({ required: false })
  @IsEnum(EntryVisibility)
  @IsOptional()
  visibility?: EntryVisibility;
}
