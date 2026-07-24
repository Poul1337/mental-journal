import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-jwt";
import type { Request } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    
    constructor(configService:ConfigService) {
        super({
            jwtFromRequest: (req: Request) => req?.cookies?.['access_token'] ?? null,
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_SECRET")
        })
    }

    validate(payload: { sub: string, anonName?: string }): { userId: string, anonName: string | undefined } {
        return {
            userId: payload.sub,
            anonName: payload.anonName
        }
    }
}