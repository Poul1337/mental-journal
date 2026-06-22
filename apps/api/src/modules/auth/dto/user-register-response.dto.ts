import { ApiProperty } from "@nestjs/swagger";

export class UserRegisterResponseDto {
    @ApiProperty({ example: "CichyWiatr" })
    anonName: String
}