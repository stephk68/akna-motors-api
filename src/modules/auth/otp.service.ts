import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpChallenge, OtpPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { PrismaService } from '../../shared/services/prisma.service';
import { MailService } from '../../shared/services/mail.service';
import { ChallengeDto } from './dto/auth-response.dto';

const MAX_ATTEMPTS = 5;

/**
 * Défis OTP : OTP de connexion mobile (SMS / Email) et 2FA du portail admin (email SMTP).
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private get ttlSeconds(): number {
    return Number(this.config.get<string>('OTP_TTL_SECONDS') ?? 300);
  }

  private get exposeCode(): boolean {
    return this.config.get<string>('OTP_EXPOSE_CODE') === 'true';
  }

  async create(
    purpose: OtpPurpose,
    target: { phone?: string; email?: string },
  ): Promise<ChallengeDto> {
    // randomInt (crypto) et non Math.random : c'est un secret d'authentification.
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

    const challenge = await this.prisma.otpChallenge.create({
      data: {
        purpose,
        phone: target.phone,
        email: target.email,
        codeHash: await bcrypt.hash(code, 10),
        expiresAt: new Date(Date.now() + this.ttlSeconds * 1000),
      },
    });

    await this.deliver(purpose, target, code);

    return {
      challengeId: challenge.id,
      expiresIn: this.ttlSeconds,
      ...(this.exposeCode ? { devCode: code } : {}),
    };
  }

  /**
   * Consomme un défi. Le défi est marqué consommé en cas de succès, et le
   * compteur de tentatives incrémenté sinon (verrouillage à 5 essais).
   */
  async consume(
    challengeId: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<OtpChallenge> {
    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: challengeId },
    });

    if (
      !challenge ||
      challenge.purpose !== purpose ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Code invalide ou expiré');
    }

    if (challenge.attempts >= MAX_ATTEMPTS) {
      throw new UnauthorizedException('Trop de tentatives, demandez un nouveau code');
    }

    if (!(await bcrypt.compare(code, challenge.codeHash))) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Code invalide ou expiré');
    }

    return this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
  }

  private async deliver(
    purpose: OtpPurpose,
    target: { phone?: string; email?: string },
    code: string,
  ): Promise<void> {
    let emailToSend = target.email;

    // Si on a uniquement le téléphone, tenter de retrouver l'email de l'utilisateur si disponible
    if (!emailToSend && target.phone) {
      const user = await this.prisma.user.findUnique({ where: { phone: target.phone } });
      if (user?.email) {
        emailToSend = user.email;
      }
    }

    const purposeTitle =
      purpose === OtpPurpose.ADMIN_2FA
        ? 'Vérification 2FA — Portail Admin'
        : purpose === OtpPurpose.PASSWORD_RESET
        ? 'Réinitialisation de mot de passe'
        : 'Code de connexion mobile';

    if (emailToSend) {
      this.logger.log(`[OTP Email] Envoi du code 2FA/OTP à : ${emailToSend}`);
      await this.mailService.sendOtpEmail(emailToSend, code, purposeTitle);
    } else {
      this.logger.warn(
        `[OTP Mock/Console] Aucun email associé pour ${purpose} (cible: ${target.phone || 'inconnu'}) - Code: ${code}`,
      );
    }
  }
}
