import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateEntryDto {
    @ApiProperty()
    @IsString()
    title!: string

    
}