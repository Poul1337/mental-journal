import { IssueEmailVerificationInputCommand } from './../interfaces/issue-email-verification-input.command';
import { Injectable } from "@nestjs/common";
import { IssueEmailVerificationPort } from "../../auth/interfaces/issue-email-verification.port";
import { UserService } from "../user.service";
import { IssueEmailVerificationResult } from "../../../common/enums/issue-email.verification-result.enum";

@Injectable()
export class IssueEmailVerificationAdapter implements IssueEmailVerificationPort {
    
    constructor(private readonly userService: UserService) {}

    async execute(input: IssueEmailVerificationInputCommand): Promise<IssueEmailVerificationResult> {
        return await this.userService.issueEmailVerification(input)
    }
}