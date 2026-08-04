import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Platform } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({ enum: Platform })
  @IsEnum(Platform)
  platform: Platform;

  @ApiPropertyOptional({ example: 'fcm-push-token-xyz' })
  @IsOptional()
  @IsString()
  pushToken?: string;
}
