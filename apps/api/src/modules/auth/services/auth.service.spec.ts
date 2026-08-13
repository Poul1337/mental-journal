import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'crypto';
import { Response } from 'express';

import { VerifyEmailResult } from '../../../common/enums/verify-email-result.enum';
import { AccountNotAllowedException } from '../../../common/exceptions/custom/account-not-allowed.exception';
import { AccountNotVerifiedException } from '../../../common/exceptions/custom/account-not-verified.exception';
import { UnauthorizedUserException } from '../../../common/exceptions/custom/unauthorized-user.exception';
import { UserStatus } from '../../../generated/prisma/enums';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { VerificationTokenExpiredException } from '../exceptions/verification-token-expired.exception';
import { VerificationTokenNotFoundException } from '../exceptions/verification-token-not-found.exception';
import { DELETE_ALL_SESSIONS_PORT } from '../ports/delete-all-sessions.port';
import { DELETE_SESSION_PORT } from '../ports/delete-session.port';
import { FIND_BY_REFRESH_TOKEN_HASH_PORT } from '../ports/find-by-refresh-token-hash.port';
import { FIND_USER_BY_EMAIL_PORT } from '../ports/find-user-by-email.port';
import { ISSUE_EMAIL_VERIFICATION_PORT } from '../ports/issue-email-verification.port';
import { REGISTER_USER_PORT } from '../ports/register-user.port';
import { SAVE_SESSION_PORT } from '../ports/save-session.port';
import { SEND_VERIFICATION_EMAIL_PORT } from '../ports/send-verification-email.port';
import { VERIFY_EMAIL_PORT } from '../ports/verify-email.port';
import { AuthService } from './auth.service';
import { HashingService } from './hashing.service';

const makeLoginDto = (overrides = {}) => ({
  email: 'test@test.pl',
  password: 'Pokemon1!',
  ...overrides,
});

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@test.pl',
  anonName: 'TestUser',
  passwordHash: 'hashedPassword123!',
  status: UserStatus.ACTIVE,
  emailVerified: true,
  ...overrides,
});

const makeRes = (withClear = false) =>
  ({
    cookie: jest.fn(),
    ...(withClear ? { clearCookie: jest.fn() } : {}),
  }) as unknown as Response;

const makeRegisterDto = () => ({
  email: 'test@test.pl',
  password: 'Pokemon1!',
  anonName: 'TestUser',
});

describe('AuthService', () => {
  let authService: AuthService;

  const registerUserPort = { execute: jest.fn() };
  const findUserByEmailPort = { execute: jest.fn() };
  const sendVerificationEmailPort = { execute: jest.fn() };
  const verifyEmailPort = { execute: jest.fn() };
  const issueEmailVerificationPort = { execute: jest.fn() };
  const saveSessionPort = { execute: jest.fn() };
  const deleteSessionPort = { execute: jest.fn() };
  const deleteAllSessionsPort = { execute: jest.fn() };
  const findByRefreshTokenHashPort = { execute: jest.fn() };

  const configService = {
    getOrThrow: jest.fn((key) => {
      const map: Record<string, string> = {
        FRONTEND_URL: 'http://localhost:3000',
        EMAIL_TTL: '10m',
        SESSION_REFRESH_TTL: '7d',
        ACCESS_TOKEN_TTL: '15m',
      };
      return map[key];
    }),
  };

  const hashingService = { hash: jest.fn(), compare: jest.fn() };
  const jwtService = { signAsync: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: configService },
        { provide: HashingService, useValue: hashingService },
        { provide: JwtService, useValue: jwtService },
        { provide: REGISTER_USER_PORT, useValue: registerUserPort },
        { provide: FIND_USER_BY_EMAIL_PORT, useValue: findUserByEmailPort },
        {
          provide: SEND_VERIFICATION_EMAIL_PORT,
          useValue: sendVerificationEmailPort,
        },
        { provide: VERIFY_EMAIL_PORT, useValue: verifyEmailPort },
        {
          provide: ISSUE_EMAIL_VERIFICATION_PORT,
          useValue: issueEmailVerificationPort,
        },
        { provide: SAVE_SESSION_PORT, useValue: saveSessionPort },
        { provide: DELETE_SESSION_PORT, useValue: deleteSessionPort },
        { provide: DELETE_ALL_SESSIONS_PORT, useValue: deleteAllSessionsPort },
        {
          provide: FIND_BY_REFRESH_TOKEN_HASH_PORT,
          useValue: findByRefreshTokenHashPort,
        },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('should log in with valid credentials', async () => {
      const loginDto = makeLoginDto();
      const user = makeUser();

      findUserByEmailPort.execute.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('access-token');
      saveSessionPort.execute.mockResolvedValue(undefined);

      const res = makeRes();

      const result = await authService.login(loginDto as LoginDto, res);

      expect(findUserByEmailPort.execute).toHaveBeenCalledWith({
        email: 'test@test.pl',
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        'Pokemon1!',
        'hashedPassword123!',
      );
      expect(saveSessionPort.execute).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        anonName: 'TestUser',
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(String),
        expect.objectContaining({ httpOnly: true, path: '/v1/auth' }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'access-token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(result).toEqual({ id: 'user-1', anonName: 'TestUser' });
    });

    it('should throw InvalidCredentialsException when user not found', async () => {
      const loginDto = makeLoginDto();

      findUserByEmailPort.execute.mockResolvedValue(null);
      hashingService.compare.mockResolvedValue(true);

      const res = makeRes();

      await expect(
        authService.login(loginDto as LoginDto, res),
      ).rejects.toThrow(InvalidCredentialsException);

      expect(findUserByEmailPort.execute).toHaveBeenCalledWith({
        email: 'test@test.pl',
      });
      expect(saveSessionPort.execute).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException when password wrong', async () => {
      const loginDto = makeLoginDto({ password: 'WrongPassword123!' });
      const user = makeUser();

      findUserByEmailPort.execute.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(false);

      const res = makeRes();

      await expect(
        authService.login(loginDto as LoginDto, res),
      ).rejects.toThrow(InvalidCredentialsException);

      expect(findUserByEmailPort.execute).toHaveBeenCalledWith({
        email: 'test@test.pl',
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        'WrongPassword123!',
        'hashedPassword123!',
      );
      expect(saveSessionPort.execute).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should throw AccountNotAllowedException when user is banned', async () => {
      const loginDto = makeLoginDto();

      const user = makeUser({ status: UserStatus.BANNED });

      findUserByEmailPort.execute.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(true);

      const res = makeRes();

      await expect(
        authService.login(loginDto as LoginDto, res),
      ).rejects.toThrow(AccountNotAllowedException);

      expect(findUserByEmailPort.execute).toHaveBeenCalledWith({
        email: 'test@test.pl',
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        'Pokemon1!',
        'hashedPassword123!',
      );
      expect(saveSessionPort.execute).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should throw AccountNotAllowedException when user is inactive', async () => {
      const loginDto = makeLoginDto();
      const user = makeUser({ status: UserStatus.INACTIVE });

      findUserByEmailPort.execute.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(true);

      const res = makeRes();

      await expect(
        authService.login(loginDto as LoginDto, res),
      ).rejects.toThrow(AccountNotAllowedException);

      expect(findUserByEmailPort.execute).toHaveBeenCalledWith({
        email: 'test@test.pl',
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        'Pokemon1!',
        'hashedPassword123!',
      );
      expect(saveSessionPort.execute).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should throw AccountNotVerifiedException when email not verified', async () => {
      const loginDto = makeLoginDto();

      const user = makeUser({ emailVerified: false });

      findUserByEmailPort.execute.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(true);

      const res = makeRes();

      await expect(
        authService.login(loginDto as LoginDto, res),
      ).rejects.toThrow(AccountNotVerifiedException);

      expect(findUserByEmailPort.execute).toHaveBeenCalledWith({
        email: 'test@test.pl',
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        'Pokemon1!',
        'hashedPassword123!',
      );
      expect(saveSessionPort.execute).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register user and send verification email', async () => {
      const registerDto = makeRegisterDto();

      hashingService.hash.mockResolvedValue('hashedPassword123!');
      registerUserPort.execute.mockResolvedValue({
        id: 'user-1',
        anonName: registerDto.anonName,
      });
      sendVerificationEmailPort.execute.mockResolvedValue(undefined);

      const result = await authService.register(registerDto as RegisterDto);

      expect(hashingService.hash).toHaveBeenCalledWith(registerDto.password);
      expect(registerUserPort.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email.trim().toLocaleLowerCase(),
          anonName: registerDto.anonName,
          passwordHash: 'hashedPassword123!',
        }),
      );
      expect(sendVerificationEmailPort.execute).toHaveBeenCalledWith({
        to: registerDto.email.trim().toLowerCase(),
        verificationLink: expect.stringContaining('/verify-email?token='),
      });
      expect(result).toEqual({ id: 'user-1', anonName: registerDto.anonName });
    });

    it('should still register when verification email fails', async () => {
      const registerDto = makeRegisterDto();

      hashingService.hash.mockResolvedValue('hashedPassword123!');
      registerUserPort.execute.mockResolvedValue({
        id: 'user-1',
        anonName: registerDto.anonName,
      });
      sendVerificationEmailPort.execute.mockRejectedValue(
        new Error('mail failed'),
      );

      const result = await authService.register(registerDto as RegisterDto);

      expect(hashingService.hash).toHaveBeenCalledWith(registerDto.password);
      expect(registerUserPort.execute).toHaveBeenCalled();
      expect(sendVerificationEmailPort.execute).toHaveBeenCalled();
      expect(result).toEqual({ id: 'user-1', anonName: registerDto.anonName });
    });
  });

  describe('verifyEmail', () => {
    it('should return success when VERIFIED', async () => {
      const plainToken = '1234567890abcdefgh';
      const tokenHash = createHash('sha256').update(plainToken).digest('hex');

      verifyEmailPort.execute.mockResolvedValue(VerifyEmailResult.VERIFIED);

      const result = await authService.verifyEmail(plainToken);

      expect(verifyEmailPort.execute).toHaveBeenCalledWith({ tokenHash });
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should throw when NOT_FOUND', async () => {
      const plainToken = '1234567890abcdefgh';
      const tokenHash = createHash('sha256').update(plainToken).digest('hex');

      verifyEmailPort.execute.mockResolvedValue(VerifyEmailResult.NOT_FOUND);

      await expect(authService.verifyEmail(plainToken)).rejects.toThrow(
        VerificationTokenNotFoundException,
      );

      expect(verifyEmailPort.execute).toHaveBeenCalledWith({ tokenHash });
    });

    it('should throw when EXPIRED', async () => {
      const plainToken = '1234567890abcdefgh';
      const tokenHash = createHash('sha256').update(plainToken).digest('hex');

      verifyEmailPort.execute.mockResolvedValue(VerifyEmailResult.EXPIRED);

      await expect(authService.verifyEmail(plainToken)).rejects.toThrow(
        VerificationTokenExpiredException,
      );

      expect(verifyEmailPort.execute).toHaveBeenCalledWith({ tokenHash });
    });
  });

  describe('refresh', () => {
    it('should throw when refresh token missing', async () => {
      const res = makeRes(true);

      await expect(authService.refresh(res, undefined)).rejects.toThrow(
        UnauthorizedUserException,
      );

      expect(findByRefreshTokenHashPort.execute).not.toHaveBeenCalled();
    });

    it('should throw when session missing or expire', async () => {
      const plainToken = '1234567890abcdefgh';
      const tokenHash = createHash('sha256').update(plainToken).digest('hex');
      const res = makeRes(true);

      findByRefreshTokenHashPort.execute.mockResolvedValue(null);

      await expect(authService.refresh(res, plainToken)).rejects.toThrow(
        UnauthorizedUserException,
      );

      expect(findByRefreshTokenHashPort.execute).toHaveBeenCalledWith({
        refreshTokenHash: tokenHash,
      });
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ path: '/v1/auth' }),
      );
    });

    it('should refresh tokens on valid session', async () => {
      const refreshToken = '1234567890abcdefgh';
      const oldTokenHash = createHash('sha256')
        .update(refreshToken)
        .digest('hex');
      const res = makeRes(true);

      findByRefreshTokenHashPort.execute.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
        user: {
          id: 'user-1',
          anonName: 'TestUser',
          status: UserStatus.ACTIVE,
          emailVerified: true,
        },
      });

      deleteSessionPort.execute.mockResolvedValue(undefined);
      saveSessionPort.execute.mockResolvedValue(undefined);
      jwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await authService.refresh(res, refreshToken);

      expect(findByRefreshTokenHashPort.execute).toHaveBeenCalledWith({
        refreshTokenHash: oldTokenHash,
      });
      expect(deleteSessionPort.execute).toHaveBeenCalledWith({
        refreshTokenHash: oldTokenHash,
      });
      expect(saveSessionPort.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        refreshTokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      });
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(String),
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'new-access-token',
        expect.any(Object),
      );
      expect(result).toEqual({ id: 'user-1', anonName: 'TestUser' });
    });
  });

  describe('logout', () => {
    it('should delete session and clear cookies when refresh token provided', async () => {
      const refreshToken = '1234567890abcdefgh';
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
      const res = makeRes(true);

      deleteSessionPort.execute.mockResolvedValue(undefined);

      const result = await authService.logout(res, refreshToken);

      expect(deleteSessionPort.execute).toHaveBeenCalledWith({
        refreshTokenHash: tokenHash,
      });
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ path: '/' }),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ path: '/v1/auth' }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should clear cookies even without refresh token', async () => {
      const res = makeRes(true);

      deleteSessionPort.execute.mockResolvedValue(undefined);

      const result = await authService.logout(res, undefined);

      expect(deleteSessionPort.execute).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ path: '/' }),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ path: '/v1/auth' }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('logoutAll', () => {
    it('should logout all', async () => {
      const res = makeRes(true);

      deleteAllSessionsPort.execute.mockResolvedValue(undefined);

      const result = await authService.logoutAll(res, 'user-1');

      expect(deleteAllSessionsPort.execute).toHaveBeenCalledWith({
        userId: 'user-1',
      });
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ path: '/' }),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ path: '/v1/auth' }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
