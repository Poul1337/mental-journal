import { DomainException } from "../../../common/exception/domain.exception";

export class AnonNameInvalidException extends DomainException {
    constructor() {
        super("anonName: must be 3–24 chars with letters, digits or underscore");
    }
}