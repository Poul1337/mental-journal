import { UserRegisterDto } from './dto/user-register.dto';
import { UserRegisterResponseDto } from './dto/user-register-response.dto';
import { AuthService } from './service/auth.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res, UseGuards } from "@nestjs/common";
import { ApiCreatedResponse } from '@nestjs/swagger';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { UserLoginDto } from './dto/user-login.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from './decorators/current-user.decorator';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @ApiCreatedResponse({ type: UserRegisterResponseDto })
    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    async registerUser(@Body() dto: UserRegisterDto): Promise<UserRegisterResponseDto> {
        return this.authService.registerUser(dto);
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: UserLoginDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<UserLoginResponseDto> {
        return this.authService.loginUser(dto, res);
    }

    @Get('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Query('token') token: string): Promise<VerifyEmailResponseDto> {
        return this.authService.verifyEmail(token);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() currentUser: AuthUser) {
        return currentUser;
    }

    //TODO: resend-verification
    //TODO: logout
    //TODO: refresh
}