import { HttpStatus } from "@nestjs/common";
import { AppException } from "../../../common/exception/app.exception";

export class AccountNotAllowedException extends AppException {
    constructor() {
        super("auth: Account is not allowed to sign in", HttpStatus.FORBIDDEN)
    }
}