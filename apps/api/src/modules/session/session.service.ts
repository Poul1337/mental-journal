import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FindByRefreshTokenHashCommand } from "./interface/find-by-refresh-token-hash.command";

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

    async findByRefreshTokenHash(refreshTokenHash: string): Promise<FindByRefreshTokenHashCommand | null> {
        return await this.prisma.session.findUnique({
            where: { refreshTokenHash },
            select: {
                id: true,
                userId: true,
                expiresAt: true,
                user: {
                    select: { 
                        id: true,
                        anonName: true,
                        status: true,
                        emailVerified: true
                    }
                }
            }
        })
    }
}