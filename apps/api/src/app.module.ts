import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { JournalModule } from './modules/journal/journal.module';
import { PrismaModule } from './prisma/prisma.module';

const throttleFactory = (configService: ConfigService) => ({
  throttlers: [
    {
      name: 'default',
      ttl: configService.get<number>('THROTTLE_TTL_MS', 60_000),
      limit: configService.get<number>('THROTTLE_LIMIT', 100),
    },
  ],
});

const i18nModuleFactory = (configService: ConfigService) => ({
  fallbackLanguage: configService.get<string>('FALLBACK_LANGUAGE', 'pl'),
  loaderOptions: {
    path: path.join(__dirname, '/i18n/'),
    watch: true,
  },
});

const i18nModuleResolvers = [
  new HeaderResolver(['x-lang']),
  AcceptLanguageResolver,
  { use: QueryResolver, options: ['lang'] },
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: throttleFactory,
    }),
    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: i18nModuleFactory,
      resolvers: i18nModuleResolvers,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    JournalModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
