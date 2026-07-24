import { HttpStatus } from "@nestjs/common";
import { AppException } from "../../../common/exception/app.exception";

export class UserAlreadyExistsException extends AppException {
    constructor() {
        super("user: User already exists", HttpStatus.CONFLICT)
    }
}