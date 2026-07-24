import { UserStatus } from "../../../generated/prisma/enums";

export interface UserForLogin {
    id: string;
    email: string;
    anonName: string;
    passwordHash: string;
    status: UserStatus;
    emailVerified: boolean
}

export interface FindUserByEmailPort {
    execute(email: string): Promise<UserForLogin | null>
}

export const FIND_USER_BY_EMAIL_PORT = Symbol('FIND_USER_BY_EMAIL_PORT')