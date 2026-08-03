import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class IssueEmailVerificationDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}
