import { DomainException } from "../../../common/exception/domain.exception";

export class PasswordInvalidException extends DomainException {
    constructor() {
        super("Password must be 8–72 chars with upper, lower, digit and special char")
        this.name = "PasswordInvalidException"
    }
}