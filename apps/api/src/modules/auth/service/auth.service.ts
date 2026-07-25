import { ISSUE_EMAIL_VERIFICATION_PORT, IssueEmailVerificationPort } from './../interfaces/issue-email-verification.port';
import { Inject, Injectable, Logger } from "@nestjs/common";
import { HashingService } from "./hashing.service";
import { REGISTER_USER_PORT, RegisterUserPort } from "../interfaces/create-user.port";
import { UserRegisterDto } from "../dto/user-register.dto";
import { UserRegisterResponseDto } from "../dto/user-register-response.dto";
import { Password } from "../value-objects/password.vo";
import { UserLoginDto } from "../dto/user-login.dto";
import { FIND_USER_BY_EMAIL_PORT, FindUserByEmailPort } from "../interfaces/find-user-by-email.port";
import { UserLoginResponseDto } from "../dto/user-login-response.dto";
import { InvalidCredentialsException } from "../exceptions/invalidCredentials.exception";
import { AccountNotAllowedException } from "../exceptions/account-not-allowed.exception";
import { UserStatus } from "../../../generated/prisma/enums";
import { JwtService } from "@nestjs/jwt";
import type { Response } from "express";
import { SEND_VERIFICATION_EMAIL_PORT, SendVerificationEmailPort } from "../interfaces/send-verification-email.port";
import { createEmailVerificationToken } from "../utils/create-email-verification-token.util";
import { ConfigService } from "@nestjs/config";
import { VERIFY_EMAIL_PORT, VerifyEmailPort } from "../interfaces/verify-email.port";
import { createHash } from "crypto";
import { VerifyEmailResult } from "../../../common/enums/verify-email-result.enum";
import { VerificationTokenNotFoundException } from "../exceptions/verification-token-not-found.exception";
import { VerificationTokenExpiredException } from "../exceptions/verification-token-expired.exception";
import { VerifyEmailResponseDto } from "../dto/verify-email-response.dto";
import { AccountNotVerifiedException } from "../exceptions/account-not-verified.exception";
import { IssueEmailVerificationResult } from '../../../common/enums/issue-email.verification-result.enum';
import { IssueEmailVerificationResponseDto } from '../dto/issue-email-verification-response.dto';

const DUMMY_PASSWORD_HASH =
  '$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

const VERIFY_EMAIL_ERRORS: Partial<Record<VerifyEmailResult, new () => Error>> = {
    [VerifyEmailResult.NOT_FOUND]: VerificationTokenNotFoundException,
    [VerifyEmailResult.EXPIRED]: VerificationTokenExpiredException
}

const VERIFY_EMAIL_MESSAGES: Partial<Record<VerifyEmailResult, string>> = {
    [VerifyEmailResult.VERIFIED]: 'Email verified successfully',
    [VerifyEmailResult.ALREADY_VERIFIED]: 'Email already verified'
}

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name)

    private readonly frontEndUrl: string;

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
        private readonly issueEmailVerificationPort: IssueEmailVerificationPort
    ) {
        this.frontEndUrl = this.configService.getOrThrow<string>("FRONTEND_URL");
    }

    async registerUser(dto: UserRegisterDto): Promise<UserRegisterResponseDto> {
        const password = Password.create(dto.password);
        const passwordHash = await this.hashingService.hash(password.getValue());
        const email = dto.email.trim().toLowerCase();
        
        const { token, tokenHash, expiresAt } = createEmailVerificationToken();
        const verificationLink = `${this.frontEndUrl}/verify-email?token=${token}`

        const result = await this.registerUserPort.execute({
            email,
            anonName: dto.anonName,
            passwordHash,
            emailVerificationTokenHash: tokenHash,
            emailVerificationTokenExpiresAt: expiresAt
        }) 

        try {
            await this.sendVerificationEmailPort.execute(email, verificationLink)
        } catch(error) {
            this.logger.warn(`Verification email failed for ${email}`, error);
        }

        return { id: result.id, anonName: result.anonName }
    }

    async loginUser(dto: UserLoginDto, res: Response): Promise<UserLoginResponseDto> {
        const normalized = dto.email.trim().toLowerCase()
        const user = await this.findUserByEmailPort.execute(normalized)

        const hashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH
        const ok = await this.hashingService.compare(dto.password, hashToCompare);

        if(!user || !ok) throw new InvalidCredentialsException();

        if(user.status === UserStatus.BANNED || user.status === UserStatus.INACTIVE) 
            throw new AccountNotAllowedException();

        if(!user.emailVerified) throw new AccountNotVerifiedException();        

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            anonName: user.anonName
        })

        res.cookie('access_token', accessToken , {
            httpOnly: true,
            sameSite: 'lax',
            path: "/",
            maxAge: 15 * 60 * 1000,
        })

        return { id: user.id, anonName: user.anonName }
    }

    async verifyEmail(plainToken: string): Promise<VerifyEmailResponseDto> {
        const tokenHash = createHash('sha256').update(plainToken.trim()).digest('hex')

        const result = await this.verifyEmailPort.execute(tokenHash);

        const Exception = VERIFY_EMAIL_ERRORS[result]

        if(Exception) throw new Exception();

        return {
            message: VERIFY_EMAIL_MESSAGES[result] ?? 'Email verified successfully'
        }
    }

    async issueEmailVerification(email: string): Promise<IssueEmailVerificationResponseDto> {
        const normalized = email.trim().toLowerCase();
        const { token, tokenHash, expiresAt } = createEmailVerificationToken()
        const verificationLink = `${this.frontEndUrl}/verify-email?token=${token}`

        const result = await this.issueEmailVerificationPort.execute({
            email: normalized,
            tokenHash,
            expiresAt
        });

        if(result === IssueEmailVerificationResult.ISSUED) {
            try {
                await this.sendVerificationEmailPort.execute(normalized, verificationLink)
            } catch(error) {
                this.logger.warn(`Verification email failed for ${normalized}`, error)
            }
        }

        return {
            message: "If an account exists and needs verification, we sent an email."
        }
    }

}