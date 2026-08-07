import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyEmailQueryDto {
  @ApiProperty()
  @IsString()
  token!: string;
}
