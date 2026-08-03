import { ApiProperty } from '@nestjs/swagger';

export class UserLoginResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  anonName!: string;
}
