import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IssueEmailVerificationDto } from './dtos/issue-email-verification.dto';
import { IssueEmailVerificationResponseDto } from './dtos/issue-email-verification-response.dto';
import { LoginDto } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LogoutResponseDto } from './dtos/logout-response.dto';
import { RefreshResponseDto } from './dtos/refresh-response.dto';
import { RegisterDto } from './dtos/register.dto';
import { RegisterResponseDto } from './dtos/register-response.dto';
import { VerifyEmailQueryDto } from './dtos/verify-email-query.dto';
import { VerifyEmailResponseDto } from './dtos/verify-email-response.dto';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ type: RegisterResponseDto })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  registerUser(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto, res);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(
    @Query() dto: VerifyEmailQueryDto,
  ): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(dto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() currentUser: AuthUser) {
    return currentUser;
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  issueVerificationEmail(
    @Body() dto: IssueEmailVerificationDto,
  ): Promise<IssueEmailVerificationResponseDto> {
    return this.authService.issueEmailVerification(dto.email);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    const refreshToken = req.cookies?.['refresh_token'];
    return this.authService.logout(res, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  logoutAllSessions(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<LogoutResponseDto> {
    const userId = currentUser.userId;
    return this.authService.logoutAll(res, userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(res, req.cookies?.['refresh_token']);
  }
}
