import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  anonName!: string;
}
