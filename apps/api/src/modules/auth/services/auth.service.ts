import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import type { Response } from 'express';

import { ErrorPath } from '../../../common/const/error-path.const';
import { IssueEmailVerificationResult } from '../../../common/enums/issue-email.verification-result.enum';
import { VerifyEmailResult } from '../../../common/enums/verify-email-result.enum';
import { AccountNotAllowedException } from '../../../common/exceptions/custom/account-not-allowed.exception';
import { assertAccountCanAct } from '../../../common/utils/assert-account-can-act.util';
import { UserStatus } from '../../../generated/prisma/enums';
import { IssueEmailVerificationResponseDto } from '../dtos/issue-email-verification-response.dto';
import { LogoutResponseDto } from '../dtos/logout-response.dto';
import { RefreshTokenResultDto } from '../dtos/refresh-token-result.dto';
import { UserLoginDto } from '../dtos/user-login.dto';
import { UserLoginResponseDto } from '../dtos/user-login-response.dto';
import { UserRegisterDto } from '../dtos/user-register.dto';
import { UserRegisterResponseDto } from '../dtos/user-register-response.dto';
import { VerifyEmailResponseDto } from '../dtos/verify-email-response.dto';
import { InvalidCredentialsException } from '../exceptions/invalidCredentials.exception';
import { UnauthorizedUserException } from '../exceptions/unauthorized-user.exception';
import { VerificationTokenExpiredException } from '../exceptions/verification-token-expired.exception';
import { VerificationTokenNotFoundException } from '../exceptions/verification-token-not-found.exception';
import {
  REGISTER_USER_PORT,
  RegisterUserPort,
} from '../interfaces/create-user.port';
import {
  DELETE_ALL_SESSIONS_PORT,
  DeleteAllSessionsPort,
} from '../interfaces/delete-all-sessions.port';
import {
  DELETE_SESSION_PORT,
  DeleteSessionPort,
} from '../interfaces/delete-session.port';
import {
  FIND_BY_REFRESH_TOKEN_HASH_PORT,
  FindByRefreshTokenHashPort,
} from '../interfaces/find-by-refresh-token-hash.port';
import {
  FIND_USER_BY_EMAIL_PORT,
  FindUserByEmailPort,
} from '../interfaces/find-user-by-email.port';
import {
  SAVE_SESSION_PORT,
  SaveSessionPort,
} from '../interfaces/save-session.port';
import {
  SEND_VERIFICATION_EMAIL_PORT,
  SendVerificationEmailPort,
} from '../interfaces/send-verification-email.port';
import {
  VERIFY_EMAIL_PORT,
  VerifyEmailPort,
} from '../interfaces/verify-email.port';
import { createRandomToken } from '../utils/create-random-token.util';
import { parseTtlMs } from '../utils/parse-ttl-ms.util';
import { Password } from '../value-objects/password.vo';
import {
  ISSUE_EMAIL_VERIFICATION_PORT,
  IssueEmailVerificationPort,
} from '../interfaces/issue-email-verification.port';
import { HashingService } from './hashing.service';

const DUMMY_PASSWORD_HASH =
  '$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

const VERIFY_EMAIL_ERRORS: Partial<Record<VerifyEmailResult, new () => Error>> =
  {
    [VerifyEmailResult.NOT_FOUND]: VerificationTokenNotFoundException,
    [VerifyEmailResult.EXPIRED]: VerificationTokenExpiredException,
  };

const VERIFY_EMAIL_MESSAGES: Partial<Record<VerifyEmailResult, string>> = {
  [VerifyEmailResult.VERIFIED]: 'Email verified successfully',
  [VerifyEmailResult.ALREADY_VERIFIED]: 'Email already verified',
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly frontEndUrl: string;

  private readonly emailTtlMs: number;

  private readonly sessionRefreshTtlMs: number;

  private readonly accessTokenTtlMs: number;

  constructor(
    private readonly configService: ConfigService,

    private readonly hashingService: HashingService,

    private readonly jwtService: JwtService,

    @Inject(REGISTER_USER_PORT)
    private readonly registerUserPort: RegisterUserPort,

    @Inject(FIND_USER_BY_EMAIL_PORT)
    private readonly findUserByEmailPort: FindUserByEmailPort,

    @Inject(SEND_VERIFICATION_EMAIL_PORT)
    private readonly sendVerificationEmailPort: SendVerificationEmailPort,

    @Inject(VERIFY_EMAIL_PORT)
    private readonly verifyEmailPort: VerifyEmailPort,

    @Inject(ISSUE_EMAIL_VERIFICATION_PORT)
    private readonly issueEmailVerificationPort: IssueEmailVerificationPort,

    @Inject(SAVE_SESSION_PORT)
    private readonly saveSessionPort: SaveSessionPort,

    @Inject(DELETE_SESSION_PORT)
    private readonly deleteSessionPort: DeleteSessionPort,

    @Inject(DELETE_ALL_SESSIONS_PORT)
    private readonly deleteAllSessionsPort: DeleteAllSessionsPort,

    @Inject(FIND_BY_REFRESH_TOKEN_HASH_PORT)
    private readonly findByRefreshTokenHashPort: FindByRefreshTokenHashPort,
  ) {
    this.frontEndUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    this.emailTtlMs = parseTtlMs(
      this.configService.getOrThrow<string>('EMAIL_TTL'),
      'EMAIL_TTL',
    );
    this.sessionRefreshTtlMs = parseTtlMs(
      this.configService.getOrThrow<string>('SESSION_REFRESH_TTL'),
      'SESSION_REFRESH_TTL',
    );
    this.accessTokenTtlMs = parseTtlMs(
      this.configService.getOrThrow<string>('ACCESS_TOKEN_TTL'),
      'ACCESS_TOKEN_TTL',
    );
  }

  async registerUser(dto: UserRegisterDto): Promise<UserRegisterResponseDto> {
    const password = Password.create(dto.password);
    const passwordHash = await this.hashingService.hash(password.getValue());
    const email = dto.email.trim().toLowerCase();

    const { token, tokenHash, expiresAt } = createRandomToken(this.emailTtlMs);
    const verificationLink = `${this.frontEndUrl}/verify-email?token=${token}`;

    const result = await this.registerUserPort.execute({
      email,
      anonName: dto.anonName,
      passwordHash,
      emailVerificationTokenHash: tokenHash,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    try {
      await this.sendVerificationEmailPort.execute(email, verificationLink);
    } catch (error) {
      this.logger.warn(`Verification email failed for ${email}`, error);
    }

    return { id: result.id, anonName: result.anonName };
  }

  async loginUser(
    dto: UserLoginDto,
    res: Response,
  ): Promise<UserLoginResponseDto> {
    const normalized = dto.email.trim().toLowerCase();
    const user = await this.findUserByEmailPort.execute(normalized);

    const hashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const ok = await this.hashingService.compare(dto.password, hashToCompare);

    if (!user || !ok) throw new InvalidCredentialsException();

    assertAccountCanAct(user, ErrorPath.AUTH);

    const {
      token: refreshToken,
      tokenHash,
      expiresAt,
    } = createRandomToken(this.sessionRefreshTtlMs);

    await this.saveSessionPort.execute(user.id, tokenHash, expiresAt);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      path: '/v1/auth',
      sameSite: 'lax',
      maxAge: this.sessionRefreshTtlMs,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      anonName: user.anonName,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: this.accessTokenTtlMs,
    });

    return { id: user.id, anonName: user.anonName };
  }

  async verifyEmail(plainToken: string): Promise<VerifyEmailResponseDto> {
    const tokenHash = createHash('sha256')
      .update(plainToken.trim())
      .digest('hex');

    const result = await this.verifyEmailPort.execute(tokenHash);

    const Exception = VERIFY_EMAIL_ERRORS[result];

    if (Exception) throw new Exception();

    return {
      message: VERIFY_EMAIL_MESSAGES[result] ?? 'Email verified successfully',
    };
  }

  async issueEmailVerification(
    email: string,
  ): Promise<IssueEmailVerificationResponseDto> {
    const normalized = email.trim().toLowerCase();
    const { token, tokenHash, expiresAt } = createRandomToken(this.emailTtlMs);
    const verificationLink = `${this.frontEndUrl}/verify-email?token=${token}`;

    const result = await this.issueEmailVerificationPort.execute({
      email: normalized,
      tokenHash,
      expiresAt,
    });

    if (result === IssueEmailVerificationResult.ISSUED) {
      try {
        await this.sendVerificationEmailPort.execute(
          normalized,
          verificationLink,
        );
      } catch (error) {
        this.logger.warn(`Verification email failed for ${normalized}`, error);
      }
    }

    return {
      message: 'If an account exists and needs verification, we sent an email.',
    };
  }

  async logoutUser(
    res: Response,
    refreshToken?: string,
  ): Promise<LogoutResponseDto> {
    if (refreshToken) {
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
      await this.deleteSessionPort.execute(tokenHash);
    }

    res.clearCookie('access_token', {
      path: '/',
      sameSite: 'lax',
    });
    res.clearCookie('refresh_token', {
      path: '/v1/auth',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  async logoutAll(res: Response, userId: string): Promise<LogoutResponseDto> {
    await this.deleteAllSessionsPort.execute(userId);

    res.clearCookie('access_token', {
      path: '/',
      sameSite: 'lax',
    });
    res.clearCookie('refresh_token', {
      path: '/v1/auth',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  async refreshToken(
    res: Response,
    refreshToken?: string,
  ): Promise<RefreshTokenResultDto> {
    if (!refreshToken) throw new UnauthorizedUserException();

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const session = await this.findByRefreshTokenHashPort.execute(tokenHash);

    if (!session || session.expiresAt.getTime() < Date.now()) {
      res.clearCookie('refresh_token', {
        path: '/v1/auth',
        sameSite: 'lax',
      });
      throw new UnauthorizedUserException();
    }

    if (session.user.status !== UserStatus.ACTIVE) {
      res.clearCookie('refresh_token', {
        path: '/v1/auth',
        sameSite: 'lax',
      });
      throw new AccountNotAllowedException(ErrorPath.AUTH);
    }

    const {
      token: newRefresh,
      tokenHash: newHash,
      expiresAt,
    } = createRandomToken(this.sessionRefreshTtlMs);

    await this.deleteSessionPort.execute(tokenHash);
    await this.saveSessionPort.execute(session.userId, newHash, expiresAt);

    res.cookie('refresh_token', newRefresh, {
      httpOnly: true,
      path: '/v1/auth',
      sameSite: 'lax',
      maxAge: this.sessionRefreshTtlMs,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: session.userId,
      anonName: session.user.anonName,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: this.accessTokenTtlMs,
    });

    return { id: session.userId, anonName: session.user.anonName };
  }
}
