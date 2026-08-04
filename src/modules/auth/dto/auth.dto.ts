import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

/** Format E.164 : +225XXXXXXXXXX */
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@akna.ci' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe fait au moins 8 caractères' })
  password: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: '+2250700000002', description: 'Numéro au format E.164' })
  @Matches(PHONE_REGEX, { message: 'Numéro invalide, format attendu : +2250700000002' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: "Identifiant du défi renvoyé par l'étape précédente" })
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({ example: '123456', description: 'Code à 6 chiffres' })
  @IsString()
  @Length(6, 6, { message: 'Le code comporte 6 chiffres' })
  code: string;
}

export class MobileRegisterDto {
  @ApiProperty({ example: '+2250700001234' })
  @Matches(PHONE_REGEX, { message: 'Numéro invalide, format attendu : +2250700001234' })
  phone: string;

  @ApiProperty({ example: 'Aminata' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Koné' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: 'a.kone@example.ci' })
  @IsOptional()
  @IsEmail({}, { message: 'Adresse email invalide' })
  email?: string;

  @ApiPropertyOptional({ example: 'fr', enum: ['fr', 'en'] })
  @IsOptional()
  @IsIn(['fr', 'en'])
  locale?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token obtenu au login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@akna.ci' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: 'NouveauPass123!' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe fait au moins 8 caractères' })
  newPassword: string;
}
