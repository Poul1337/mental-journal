import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { PrismaService } from "../../prisma/prisma.service";
import { SkipThrottle } from "@nestjs/throttler";

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly prisma: PrismaService
    ) {}

    @SkipThrottle()
    @Get()
    @HealthCheck()
    async check() {
        return this.health.check([
            async () =>  { 
                await this.prisma.$queryRaw`SELECT 1`;
                return { db: { status: 'up' }};
            }
        ])
    }
}