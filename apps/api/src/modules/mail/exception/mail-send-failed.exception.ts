import { HttpStatus } from "@nestjs/common";
import { AppException } from "../../../common/exception/app.exception";

export class MailSendFailedException extends AppException {
    constructor() {
        super('mail: Failed to send email', HttpStatus.BAD_GATEWAY)
    }
}