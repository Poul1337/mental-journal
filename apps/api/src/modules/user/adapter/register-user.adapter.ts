import { Injectable } from "@nestjs/common";
import { RegisterUserInput, RegisterUserPort, RegisterUserResult } from "../../auth/interfaces/create-user.port";
import { UserService } from "../user.service";

@Injectable()
export class RegisterUserAdapter implements RegisterUserPort {
    constructor(
        private readonly userService: UserService
    ) {}

    async execute(input: RegisterUserInput): Promise<RegisterUserResult> {
        const user = await this.userService.registerUser({
            email: input.email,
            anonName: input.anonName,
            passwordHash: input.passwordHash,
            emailVerificationTokenHash: input.emailVerificationTokenHash,
            emailVerificationTokenExpiresAt: input.emailVerificationTokenExpiresAt,
        })
        
        return { id: user.id, anonName: user.anonName }
    }
}