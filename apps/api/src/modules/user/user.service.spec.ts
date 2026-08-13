import { Test, TestingModule } from '@nestjs/testing';

import { IssueEmailVerificationResult } from '../../common/enums/issue-email-verification-result.enum';
import { VerifyEmailResult } from '../../common/enums/verify-email-result.enum';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonNameInvalidException } from './exceptions/anon-name-invalid.exception';
import { UserAlreadyExistsException } from './exceptions/user-already-exists.exception';
import { UserService } from './user.service';

const TEST_HASH =
  '$2a$12$5SLvrXfN6Ufs22pBC66ZquvpDK5heqBXZzVZQrMheO6GIvaWuG4Lu';
const USER_ID = 'user-1';
const TEST_EMAIL = 'test@test.pl';

const makeUser = (overrides = {}) => ({
  id: USER_ID,
  email: TEST_EMAIL,
  anonName: 'TestUser',
  passwordHash: 'hash',
  status: 'ACTIVE',
  emailVerified: true,
  ...overrides,
});

const createRegisterInput = (overrides = {}) => ({
  email: TEST_EMAIL,
  anonName: 'TestUser',
  passwordHash: 'Pokemon1!',
  emailVerificationTokenHash: TEST_HASH,
  emailVerificationTokenExpiresAt: new Date(Date.now()),
  ...overrides,
});

const createIssueInput = (overrides = {}) => ({
  email: TEST_EMAIL,
  tokenHash: TEST_HASH,
  expiresAt: new Date(Date.now() + 60_000),
  ...overrides,
});

const findByEmailSelect = {
  id: true,
  email: true,
  anonName: true,
  passwordHash: true,
  status: true,
  emailVerified: true,
} as const;

const verifyEmailSelect = {
  id: true,
  emailVerified: true,
  emailVerificationTokenExpiresAt: true,
} as const;

const findByIdSelect = {
  id: true,
  status: true,
  emailVerified: true,
} as const;

const issueVerificationSelect = {
  id: true,
  emailVerified: true,
} as const;

describe('UserService', () => {
  let userService: UserService;

  const prismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const expectFindByEmailLookup = (email: string) =>
    expect(prismaService.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email },
        select: findByEmailSelect,
      }),
    );

  const expectVerifyEmailLookup = () =>
    expect(prismaService.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { emailVerificationTokenHash: TEST_HASH },
        select: verifyEmailSelect,
      }),
    );

  const expectFindByIdLookup = (id: string) =>
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id },
      select: findByIdSelect,
    });

  const expectIssueVerificationLookup = (email = TEST_EMAIL) =>
    expect(prismaService.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email },
        select: issueVerificationSelect,
      }),
    );

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    userService = module.get(UserService);
  });

  describe('registerUser', () => {
    it('should create a new user', async () => {
      const input = createRegisterInput();

      prismaService.user.create.mockResolvedValue({
        id: USER_ID,
        anonName: 'TestUser',
      });

      const result = await userService.registerUser(input);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: TEST_EMAIL,
          anonName: 'TestUser',
          passwordHash: input.passwordHash,
        }),
      });
      expect(result).toEqual({ id: USER_ID, anonName: 'TestUser' });
    });

    it('should throw AnonNameInvalidException when anonName invalid', async () => {
      const input = createRegisterInput({ anonName: 'ab' });

      await expect(userService.registerUser(input)).rejects.toThrow(
        AnonNameInvalidException,
      );
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw UserAlreadyExistsException when duplicate email', async () => {
      const input = createRegisterInput();

      prismaService.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(userService.registerUser(input)).rejects.toThrow(
        UserAlreadyExistsException,
      );
      expect(prismaService.user.create).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(makeUser());

      const result = await userService.findByEmail(TEST_EMAIL);

      expectFindByEmailLookup(TEST_EMAIL);
      expect(result).toEqual(
        expect.objectContaining({ id: USER_ID, email: TEST_EMAIL }),
      );
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await userService.findByEmail('nonexisting@email.com');

      expectFindByEmailLookup('nonexisting@email.com');
      expect(result).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    it('should return VERIFIED when token is valid', async () => {
      prismaService.user.findFirst.mockResolvedValue({
        id: USER_ID,
        emailVerified: false,
        emailVerificationTokenExpiresAt: new Date(Date.now() + 60_000),
      });
      prismaService.user.update.mockResolvedValue({});

      const result = await userService.verifyEmail(TEST_HASH);

      expectVerifyEmailLookup();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: USER_ID },
        data: {
          emailVerified: true,
          emailVerificationTokenHash: null,
          emailVerificationTokenExpiresAt: null,
        },
      });
      expect(result).toBe(VerifyEmailResult.VERIFIED);
    });

    it.each([
      ['NOT_FOUND', null, VerifyEmailResult.NOT_FOUND],
      [
        'ALREADY_VERIFIED',
        { emailVerified: true },
        VerifyEmailResult.ALREADY_VERIFIED,
      ],
      [
        'EXPIRED',
        {
          id: USER_ID,
          emailVerified: false,
          emailVerificationTokenExpiresAt: new Date(Date.now() - 60_000),
        },
        VerifyEmailResult.EXPIRED,
      ],
    ])('should return %s', async (_, mockUser, expected) => {
      prismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await userService.verifyEmail(TEST_HASH);

      expectVerifyEmailLookup();
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: USER_ID,
        status: 'ACTIVE',
        emailVerified: true,
      });

      const result = await userService.findById(USER_ID);

      expectFindByIdLookup(USER_ID);
      expect(result).toEqual({
        id: USER_ID,
        status: 'ACTIVE',
        emailVerified: true,
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await userService.findById(USER_ID);

      expectFindByIdLookup(USER_ID);
      expect(result).toBeNull();
    });
  });

  describe('issueEmailVerification', () => {
    it('should return ISSUED when user exists and not verified', async () => {
      const expiresAt = new Date(Date.now() + 60_000);
      const input = createIssueInput({ expiresAt });

      prismaService.user.findUnique.mockResolvedValue({
        id: USER_ID,
        emailVerified: false,
      });
      prismaService.user.update.mockResolvedValue({});

      const result = await userService.issueEmailVerification(input);

      expectIssueVerificationLookup();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: USER_ID },
        data: {
          emailVerificationTokenHash: TEST_HASH,
          emailVerificationTokenExpiresAt: expiresAt,
        },
      });
      expect(result).toBe(IssueEmailVerificationResult.ISSUED);
    });

    it.each([
      [
        'already verified',
        { id: USER_ID, emailVerified: true },
        IssueEmailVerificationResult.SKIPPED,
      ],
      ['user not found', null, IssueEmailVerificationResult.SKIPPED],
    ])('should return SKIPPED when %s', async (_, mockUser, expected) => {
      const input = createIssueInput();

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.issueEmailVerification(input);

      expectIssueVerificationLookup();
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });
});
