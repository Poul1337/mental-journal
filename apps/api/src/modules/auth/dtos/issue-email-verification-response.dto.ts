import { ApiProperty } from '@nestjs/swagger';

export class IssueEmailVerificationResponseDto {
  @ApiProperty()
  message!: string;
}
