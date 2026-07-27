import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

const throttleFactory = (configService: ConfigService) => ({
  throttlers: [
    {
      name: 'default',
      ttl: configService.get<number>('THROTTLE_TTL_MS', 60_000),
      limit: configService.get<number>('THROTTLE_LIMIT', 100),
    },
  ],
}) 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: throttleFactory
    }),
    PrismaModule, 
    HealthModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard }
  ]
})
export class AppModule {}
