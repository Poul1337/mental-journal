import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterResponseDto {
  @ApiProperty({ example: '40872a11-e023-4ce0-817e-80245d5dc735' })
  id!: string;

  @ApiProperty({ example: 'CichyWiatr' })
  anonName!: string;
}
