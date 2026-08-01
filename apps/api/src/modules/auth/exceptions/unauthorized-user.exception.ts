import { HttpStatus } from '@nestjs/common';
import { AppException } from "../../../common/exception/app.exception";

export class UnauthorizedUserException extends AppException {
    constructor() {
        super("auth: user unauthorized", HttpStatus.UNAUTHORIZED)
    }
}