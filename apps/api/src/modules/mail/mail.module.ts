import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { SendVerificationEmailAdapter } from "./adapter/send-verification-email.adapter";
import { SEND_VERIFICATION_EMAIL_PORT } from "../auth/interfaces/send-verification-email.port";

@Module({
    providers: [
        MailService,
        { provide: SEND_VERIFICATION_EMAIL_PORT, useClass: SendVerificationEmailAdapter }
    ],
    exports: [SEND_VERIFICATION_EMAIL_PORT]
})
export class MailModule {}