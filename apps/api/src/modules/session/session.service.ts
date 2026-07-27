import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SessionService {

    constructor(
        private readonly prisma: PrismaService
    ) {}

    async saveSession(userId: string, refreshTokenHash: string, expiresAt: Date): Promise<void> {
        await this.prisma.session.create({
            data: {
                userId,
                refreshTokenHash,
                expiresAt,
            }
        })
    }

    async deleteSession(refreshTokenHash: string): Promise<void> {
        await this.prisma.session.deleteMany({
            where: {
                refreshTokenHash
            }
        })
    }

    async deleteAllSessions(userId: string): Promise<void> {
        await this.prisma.session.deleteMany({
            where: {
                userId
            }
        })
    }
}