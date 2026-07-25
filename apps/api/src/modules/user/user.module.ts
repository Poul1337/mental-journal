import { ISSUE_EMAIL_VERIFICATION_PORT } from './../auth/interfaces/issue-email-verification.port';
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { REGISTER_USER_PORT } from "../auth/interfaces/create-user.port";
import { RegisterUserAdapter } from "./adapter/register-user.adapter";
import { FIND_USER_BY_EMAIL_PORT } from "../auth/interfaces/find-user-by-email.port";
import { FindUserByEmailAdapter } from "./adapter/find-user-by-email.adapter";
import { VERIFY_EMAIL_PORT } from "../auth/interfaces/verify-email.port";
import { VerifyEmailAdapter } from "./adapter/verify-email.adapter";
import { IssueEmailVerificationAdapter } from './adapter/issue-email-verification.adapter';

@Module({
    providers: [
        UserService,
        { provide: REGISTER_USER_PORT, useClass: RegisterUserAdapter },
        { provide: FIND_USER_BY_EMAIL_PORT, useClass: FindUserByEmailAdapter },
        { provide: VERIFY_EMAIL_PORT, useClass: VerifyEmailAdapter },
        { provide: ISSUE_EMAIL_VERIFICATION_PORT, useClass: IssueEmailVerificationAdapter }
    ],
    exports: [REGISTER_USER_PORT, FIND_USER_BY_EMAIL_PORT, VERIFY_EMAIL_PORT, ISSUE_EMAIL_VERIFICATION_PORT]
})
export class UserModule {}