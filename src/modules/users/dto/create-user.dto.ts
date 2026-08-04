import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, UserStatus, KycStatus, Plan } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: '+2250700000000' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'user@aknamotors.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

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

  @ApiPropertyOptional({ enum: Role, default: Role.PARTICULIER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: KycStatus, default: KycStatus.NONE })
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @ApiPropertyOptional({ enum: Plan, default: Plan.STANDARD })
  @IsOptional()
  @IsEnum(Plan)
  plan?: Plan;
}
