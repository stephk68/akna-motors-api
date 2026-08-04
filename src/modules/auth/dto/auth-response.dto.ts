import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus, Plan, Role, UserStatus } from '@prisma/client';

export class AuthUserDto {
  @ApiProperty() id: string;
  @ApiProperty() phone: string;
  @ApiPropertyOptional({ nullable: true }) email: string | null;
  @ApiPropertyOptional({ nullable: true }) firstName: string | null;
  @ApiPropertyOptional({ nullable: true }) lastName: string | null;
  @ApiProperty({ enum: Role }) role: Role;
  @ApiProperty({ enum: UserStatus }) status: UserStatus;
  @ApiProperty({ enum: KycStatus }) kycStatus: KycStatus;
  @ApiProperty({ enum: Plan }) plan: Plan;
  @ApiProperty({ example: 'fr' }) locale: string;
  @ApiPropertyOptional({ nullable: true }) organizationId: string | null;
}

export class TokenPairDto {
  @ApiProperty({ description: 'JWT court (15 min par défaut)' })
  accessToken: string;

  @ApiProperty({ description: 'JWT long (30 j), à usage unique — il est tourné à chaque refresh' })
  refreshToken: string;

  @ApiProperty({ example: 900, description: "Durée de vie de l'access token, en secondes" })
  expiresIn: number;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}

export class ChallengeDto {
  @ApiProperty({ description: "Identifiant à renvoyer à l'étape de vérification" })
  challengeId: string;

  @ApiProperty({ example: 300, description: 'Durée de validité du code, en secondes' })
  expiresIn: number;

  @ApiPropertyOptional({
    description:
      'Code en clair — renvoyé UNIQUEMENT si OTP_EXPOSE_CODE=true (développement). Jamais en production.',
  })
  devCode?: string;
}

export class MobileAuthDto extends TokenPairDto {
  @ApiProperty({ description: 'true si le compte vient d\'être créé par ce login' })
  isNewUser: boolean;
}
