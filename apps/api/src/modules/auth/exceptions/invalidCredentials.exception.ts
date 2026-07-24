import { HttpStatus } from "@nestjs/common";
import { AppException } from "../../../common/exception/app.exception";

export class InvalidCredentialsException extends AppException {
    constructor() {
        super("auth: Invalid email or password", HttpStatus.UNAUTHORIZED);
    }
}