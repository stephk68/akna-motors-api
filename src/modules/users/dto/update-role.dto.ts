import { IsEnum } from 'class-validator';
import { Role, UserStatus, KycStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateKycDto {
  @ApiProperty({ enum: KycStatus })
  @IsEnum(KycStatus)
  kycStatus: KycStatus;
}
