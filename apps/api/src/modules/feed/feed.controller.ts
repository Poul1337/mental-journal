import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ErrorPath } from '../../common/consts/error-path.const';
import { SetErrorPath } from '../../common/decorators/set-error-path.decorator';
import { AccountCanActGuard } from '../../common/guards/account-can-act.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ListFeedQueryDto } from './dtos/list-feed-query.dto';
import { ListFeedResponseDto } from './dtos/list-feed-response.dto';
import { FeedService } from './feed.service';

@Controller('feed')
@ApiTags('feed')
@SetErrorPath(ErrorPath.FEED)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AccountCanActGuard)
  feed(@Query() dto: ListFeedQueryDto): Promise<ListFeedResponseDto> {
    return this.feedService.feed(dto);
  }
}
