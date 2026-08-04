import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiProperty({ example: 'fr' })
  @IsString()
  locale: string;
}
