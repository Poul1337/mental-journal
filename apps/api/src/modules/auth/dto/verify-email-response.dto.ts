import { ApiProperty } from "@nestjs/swagger";

export class VerifyEmailResponseDto {
    @ApiProperty()
    message!: string;
}