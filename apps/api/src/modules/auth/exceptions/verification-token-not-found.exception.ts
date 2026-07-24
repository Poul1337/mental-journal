import { HttpStatus } from "@nestjs/common";
import { AppException } from "../../../common/exception/app.exception";

export class VerificationTokenNotFoundException extends AppException {
    constructor() {
        super("auth: verification token not found", HttpStatus.NOT_FOUND)
    }
}