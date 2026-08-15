import { Injectable } from "@nestjs/common";

import { UpdateSessionInput, UpdateSessionPort } from "../../auth/ports/update-session.port";
import { SessionService } from "../session.service";

@Injectable()
export class UpdateSessionAdapter implements UpdateSessionPort {
    constructor(
        private readonly sessionService: SessionService
    ) {}

    async execute(input: UpdateSessionInput): Promise<void> {
        await this.sessionService.updateSession(input)
    }
}