import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AccountCanActGuard } from '../../common/guards/account-can-act.guard';
import { MailModule } from '../mail/mail.module';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { HashingService } from './services/hashing.service';
import { JwtStrategy } from './strategies/jwt.strategy';

const jwtModuleFactory = (config: ConfigService) => ({
  secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
  signOptions: {
    expiresIn: config.get<string>('ACCESS_TOKEN_TTL', '15m'),
  } as JwtSignOptions,
});

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtModuleFactory,
    }),
    MailModule,
    SessionModule,
  ],
  providers: [AuthService, HashingService, JwtStrategy, AccountCanActGuard],
  controllers: [AuthController],
})
export class AuthModule {}
