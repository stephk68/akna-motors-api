import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ResetUserPasswordDto {
  @ApiPropertyOptional({
    minLength: 8,
    description:
      'Mot de passe à poser. Omis, un mot de passe temporaire est généré. Dans les deux cas il est transmis par e-mail et jamais renvoyé dans la réponse.',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Le mot de passe fait au moins 8 caractères' })
  password?: string;
}
