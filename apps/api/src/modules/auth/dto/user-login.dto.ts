import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserLoginDto {
    @ApiProperty({ example: "pawel@email.com" })
    @IsString()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: "Pokemon1!" })
    @IsString()
    password!: string;
}