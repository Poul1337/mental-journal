import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenResultDto {
    @ApiProperty()
    id!: string

    @ApiProperty()
    anonName!: string
}