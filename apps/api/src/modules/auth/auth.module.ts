import { Module } from "@nestjs/common";
import { AuthService } from "./service/auth.service";
import { HashingService } from "./service/hashing.service"
import { AuthController } from "./auth.controller";
import { UserModule } from "../user/user.module";
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt'
import { ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { MailModule } from "../mail/mail.module";
import { SessionModule } from "../session/session.module";

const jwtModuleFactory = (config: ConfigService) => ({
    secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    signOptions: {
        expiresIn: config.get<string>('ACCESS_TOKEN_TTL', '15m')
    } as JwtSignOptions
})

@Module({
    imports: [
        UserModule,
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: jwtModuleFactory,
        }),
        MailModule,
        SessionModule
    ],
    providers: [
        AuthService, 
        HashingService,
        JwtStrategy
    ],
    controllers: [AuthController]
})
export class AuthModule {}