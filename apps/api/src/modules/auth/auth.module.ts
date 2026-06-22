import { Module } from "@nestjs/common";
import { AuthService } from "./service/auth.service";
import { HashingService } from "./service/hasing.service";
import { AuthController } from "./auth.controller";

@Module({
    providers: [AuthService, HashingService],
    controllers: [AuthController]
})
export class AuthModule {}