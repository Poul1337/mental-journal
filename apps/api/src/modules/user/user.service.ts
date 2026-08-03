import { Injectable } from '@nestjs/common';

import { VerifyEmailResult } from '../../common/enums/verify-email-result.enum';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IssueEmailVerificationResult } from './../../common/enums/issue-email.verification-result.enum';
import { UserAlreadyExistsException } from './exception/user-already-exists.exception';
import { FindUserByIdResult } from './interfaces/find-user-by-id-result';
import { IssueEmailVerificationInputCommand } from './interfaces/issue-email-verification-input.command';
import { RegisterUserCommand } from './interfaces/register-user.command';
import { RegisteredUser } from './interfaces/registered-user';
import { UserCredentials } from './interfaces/user-credentials';
import { AnonName } from './value-objects/anon-name.vo';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async registerUser(command: RegisterUserCommand): Promise<RegisteredUser> {
    const email = command.email.trim().toLowerCase();
    const anonName = AnonName.create(command.anonName);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          anonName: anonName.getValue(),
          passwordHash: command.passwordHash,
          emailVerificationTokenHash: command.emailVerificationTokenHash,
          emailVerificationTokenExpiresAt:
            command.emailVerificationTokenExpiresAt,
        },
      });

      return { id: user.id, anonName: user.anonName };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new UserAlreadyExistsException();
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserCredentials | null> {
    const normalized = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email: normalized,
      },
      select: {
        id: true,
        email: true,
        anonName: true,
        passwordHash: true,
        status: true,
        emailVerified: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      anonName: user.anonName,
      passwordHash: user.passwordHash,
      status: user.status,
      emailVerified: user.emailVerified,
    };
  }

  async verifyEmail(verificationToken: string): Promise<VerifyEmailResult> {
    const normalized = verificationToken.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationTokenHash: normalized,
      },
      select: {
        id: true,
        emailVerified: true,
        emailVerificationTokenExpiresAt: true,
      },
    });

    if (!user) return VerifyEmailResult.NOT_FOUND;

    if (user.emailVerified) return VerifyEmailResult.ALREADY_VERIFIED;

    if (
      !user.emailVerificationTokenExpiresAt ||
      Date.now() > user.emailVerificationTokenExpiresAt.getTime()
    ) {
      return VerifyEmailResult.EXPIRED;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    return VerifyEmailResult.VERIFIED;
  }

  async issueEmailVerification(
    input: IssueEmailVerificationInputCommand,
  ): Promise<IssueEmailVerificationResult> {
    const email = input.email.trim().toLowerCase();
    const { tokenHash, expiresAt } = input;

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (!user) return IssueEmailVerificationResult.SKIPPED;

    if (user.emailVerified) return IssueEmailVerificationResult.SKIPPED;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationTokenExpiresAt: expiresAt,
      },
    });

    return IssueEmailVerificationResult.ISSUED;
  }

  async findById(id: string): Promise<FindUserByIdResult | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        emailVerified: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      emailVerified: user.emailVerified,
      status: user.status,
    };
  }
}
