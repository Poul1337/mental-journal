import { HttpStatus } from "@nestjs/common";
import { AppException } from "../../../common/exception/app.exception";

export class VerificationTokenExpiredException extends AppException {
    constructor() {
        super("auth: verified email expired", HttpStatus.BAD_GATEWAY)
    }
}