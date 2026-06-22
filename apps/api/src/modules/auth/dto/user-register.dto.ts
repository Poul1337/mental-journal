import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength
} from "class-validator"
import { PASSWORD_REGEX } from "../value-objects/password.vo";

export class UserRegisterDto {

    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "CichyWiatr" })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(24)
    @Matches(/^[a-zA-Z0-9_]+$/, { message: "anonName: only letters and digits" })
    anonName: string;

    @ApiProperty({ example: "StrongPass123!" })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(72)
    @Matches(PASSWORD_REGEX, { message: "" })
    password: string;
}