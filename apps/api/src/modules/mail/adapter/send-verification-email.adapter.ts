import { Injectable } from "@nestjs/common";
import { SendVerificationEmailPort } from "../../auth/interfaces/send-verification-email.port";
import { MailService } from "../mail.service";

@Injectable()
export class SendVerificationEmailAdapter implements SendVerificationEmailPort {

    constructor(
        private readonly mailService: MailService
    ) {}

    async execute(to: string, verificationLink: string): Promise<void> {
        await this.mailService.sendVerificationEmail(to, verificationLink)
    }
}