import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from '../../shared/decorators';
import { CustomRequest } from '../../shared/interfaces/custom-request';
import { UserPayload } from '../../shared/types/types';
import {
  AdminLoginDto,
  ForgotPasswordDto,
  MobileRegisterDto,
  RefreshTokenDto,
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import {
  AuthUserDto,
  ChallengeDto,
  MobileAuthDto,
  TokenPairDto,
} from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* ---------------------------------------------------------------- */
  /*  Portail admin                                                    */
  /* ---------------------------------------------------------------- */

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Étape 1 — mot de passe',
    description:
      "Vérifie les identifiants et déclenche l'envoi d'un code 2FA. Ne renvoie AUCUN token : il faut appeler /auth/admin/verify-2fa.",
  })
  @ApiOkResponse({ type: ChallengeDto })
  async adminLogin(@Body() dto: AdminLoginDto) {
    return {
      data: await this.authService.adminLogin(dto),
      message: 'Code de vérification envoyé',
    };
  }

  @Public()
  @Post('admin/verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Étape 2 — code 2FA, renvoie les tokens' })
  @ApiOkResponse({ type: TokenPairDto })
  async verifyAdmin2fa(@Body() dto: VerifyOtpDto, @Req() req: CustomRequest) {
    return {
      data: await this.authService.verifyAdmin2fa(
        dto.challengeId,
        dto.code,
        AuthController.context(req),
      ),
      message: 'Connexion réussie',
    };
  }

  @Public()
  @Post('admin/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demande un code de réinitialisation par email' })
  @ApiOkResponse({ type: ChallengeDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return {
      data: await this.authService.forgotPassword(dto),
      message: 'Si un compte existe, un code a été envoyé',
    };
  }

  @Public()
  @Post('admin/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Définit un nouveau mot de passe',
    description: 'Révoque toutes les sessions actives de l\'utilisateur.',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { data: null, message: 'Mot de passe mis à jour' };
  }

  /* ---------------------------------------------------------------- */
  /*  Application mobile                                               */
  /* ---------------------------------------------------------------- */

  @Public()
  @Post('mobile/request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Envoie un code OTP par SMS',
    description:
      "Fonctionne pour un numéro connu comme inconnu — un compte est créé à la vérification si besoin. En développement (OTP_EXPOSE_CODE=true), le code est renvoyé dans `devCode`.",
  })
  @ApiOkResponse({ type: ChallengeDto })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return {
      data: await this.authService.requestOtp(dto),
      message: 'Code envoyé par SMS',
    };
  }

  @Public()
  @Post('mobile/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifie le code OTP et renvoie les tokens' })
  @ApiOkResponse({ type: MobileAuthDto })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: CustomRequest) {
    return {
      data: await this.authService.verifyOtp(
        dto.challengeId,
        dto.code,
        AuthController.context(req),
      ),
      message: 'Connexion réussie',
    };
  }

  @Public()
  @Post('mobile/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crée un compte conducteur',
    description:
      'Le compte reste PENDING jusqu\'à la vérification du code renvoyé ici via /auth/mobile/verify-otp.',
  })
  @ApiOkResponse({ type: ChallengeDto })
  async registerMobile(@Body() dto: MobileRegisterDto) {
    return {
      data: await this.authService.registerMobile(dto),
      message: 'Compte créé, code de vérification envoyé',
    };
  }

  /* ---------------------------------------------------------------- */
  /*  Commun aux deux surfaces                                         */
  /* ---------------------------------------------------------------- */

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renouvelle la paire de tokens',
    description:
      "Rotation : l'ancien refresh token est immédiatement invalidé. Un rejeu révoque toutes les sessions de l'utilisateur.",
  })
  @ApiOkResponse({ type: TokenPairDto })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: CustomRequest) {
    return {
      data: await this.authService.refresh(
        dto.refreshToken,
        AuthController.context(req),
      ),
      message: 'Tokens renouvelés',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Révoque la session courante' })
  async logout(@CurrentUser() user: UserPayload) {
    await this.authService.logout(user.sessionId);
    return { data: null, message: 'Déconnexion réussie' };
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Profil de l\'utilisateur authentifié' })
  @ApiOkResponse({ type: AuthUserDto })
  async me(@CurrentUser('id') userId: string) {
    return { data: await this.authService.me(userId) };
  }

  private static context(req: CustomRequest) {
    return {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };
  }
}
