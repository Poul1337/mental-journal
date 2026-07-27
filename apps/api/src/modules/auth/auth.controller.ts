import { UserRegisterDto } from './dto/user-register.dto';
import { UserRegisterResponseDto } from './dto/user-register-response.dto';
import { AuthService } from './service/auth.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiCreatedResponse } from '@nestjs/swagger';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { UserLoginDto } from './dto/user-login.dto';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from './decorators/current-user.decorator';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { IssueEmailVerificationResponseDto } from './dto/issue-email-verification-response.dto';
import { IssueEmailVerificationDto } from './dto/issue-email-verification.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @ApiCreatedResponse({ type: UserRegisterResponseDto })
    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    registerUser(@Body() dto: UserRegisterDto): Promise<UserRegisterResponseDto> {
        return this.authService.registerUser(dto);
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(
        @Body() dto: UserLoginDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<UserLoginResponseDto> {
        return this.authService.loginUser(dto, res);
    }

    @Get('verify-email')
    @HttpCode(HttpStatus.OK)
    verifyEmail(@Query('token') token: string): Promise<VerifyEmailResponseDto> {
        return this.authService.verifyEmail(token);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() currentUser: AuthUser) {
        return currentUser;
    }

    @Throttle({ default: { limit: 3, ttl: 60_000 } })
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    issueVerificationEmail(@Body() dto: IssueEmailVerificationDto): Promise<IssueEmailVerificationResponseDto> {
        return this.authService.issueEmailVerification(dto.email);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LogoutResponseDto> {
        const refreshToken = req.cookies?.['refresh_token']
        return this.authService.logoutUser(res, refreshToken)
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    logoutAllSessions(
        @Res({ passthrough: true }) res: Response,
        @CurrentUser() currentUser: AuthUser
    ): Promise<LogoutResponseDto> {
        const userId = currentUser.userId
        return this.authService.logoutAll(res, userId)
    }

    //TODO: refresh
}