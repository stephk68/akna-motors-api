import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Platform } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jean' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Kouassi' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Abidjan' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'jean.kouassi@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdatePreferencesDto {
  @ApiProperty({ example: 'fr' })
  @IsString()
  locale: string;
}

export class RegisterDeviceDto {
  @ApiProperty({ enum: Platform })
  @IsEnum(Platform)
  platform: Platform;

  @ApiPropertyOptional({ example: 'fcm-push-token-xyz' })
  @IsOptional()
  @IsString()
  pushToken?: string;
}
