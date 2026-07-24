import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength
} from "class-validator"
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from "../value-objects/password.vo";
import { ANON_NAME_MAX_LENGTH, ANON_NAME_MIN_LENGTH, ANON_NAME_REGEX } from "../../user/value-objects/anon-name.vo";

export class UserRegisterDto {

    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: "CichyWiatr" })
    @IsString()
    @IsNotEmpty()
    @MinLength(ANON_NAME_MIN_LENGTH)
    @MaxLength(ANON_NAME_MAX_LENGTH)
    @Matches(ANON_NAME_REGEX, { message: "anonName: must be 3–24 chars with letters, digits or underscore" })
    anonName!: string;

    @ApiProperty({ example: "StrongPass123!" })
    @IsString()
    @IsNotEmpty()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    @Matches(PASSWORD_REGEX, { message: "password: must be 8–72 chars with upper, lower, digit and special char" })
    password!: string;
}