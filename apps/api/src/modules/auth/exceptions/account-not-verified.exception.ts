import { HttpStatus } from "@nestjs/common";
import { AppException } from "../../../common/exception/app.exception";

export class AccountNotVerifiedException extends AppException {
    constructor() {
        super("auth: account is not verified", HttpStatus.FORBIDDEN)
    }
}