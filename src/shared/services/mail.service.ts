import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure, // true for 465, false for 587/other
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`Serveur SMTP initialisé (${host}:${port}) pour ${user}`);
    } else {
      this.logger.warn(
        'Paramètres SMTP (SMTP_USER / SMTP_PASS) non configurés. Les emails seront uniquement journalisés dans la console.',
      );
    }
  }

  async sendOtpEmail(toEmail: string, code: string, purposeTitle = 'Vérification 2FA'): Promise<boolean> {
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      '"AKNA Electric Mobility" <noreply@aknamotors.com>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 40px 20px; color: #1a1a1a;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <!-- Header AKNA -->
          <div style="background: linear-gradient(135deg, #332980 0%, #1e1850 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: -0.5px;">AKNA<span style="color: #F19611;">.</span></h1>
            <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Electric Mobility</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 28px; text-align: center;">
            <h2 style="margin: 0 0 12px 0; color: #332980; font-size: 20px;">${purposeTitle}</h2>
            <p style="margin: 0 0 24px 0; color: #555555; font-size: 14.5px; line-height: 1.5;">
              Voici votre code de sécurité à 6 chiffres pour valider votre connexion au portail <strong>AKNA Motors</strong> :
            </p>
            
            <!-- Code Box -->
            <div style="background-color: #fff4e5; border: 2px dashed #F19611; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #332980; font-family: monospace;">${code}</span>
            </div>
            
            <p style="margin: 0; color: #777777; font-size: 13px;">
              Ce code expire dans <strong>5 minutes</strong>. Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 16px; text-align: center; font-size: 11.5px; color: #999999;">
            © ${new Date().getFullYear()} AKNA Motors — Abidjan, Côte d'Ivoire. Tous droits réservés.
          </div>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject: `[AKNA Motors] Votre code de sécurité : ${code}`,
          html: htmlContent,
        });
        this.logger.log(`Email OTP envoyé avec succès à : ${toEmail}`);
        return true;
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email OTP à ${toEmail}`, error);
      }
    }

    this.logger.warn(`[MAIL FALLBACK] OTP pour ${toEmail} : ${code}`);
    return false;
  }

  async sendWelcomeEmail(
    toEmail: string,
    firstName: string,
    initialPassword = 'Password123!',
    role = 'ADMIN',
  ): Promise<boolean> {
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      '"AKNA Electric Mobility" <noreply@aknamotors.com>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 40px 20px; color: #1a1a1a;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <!-- Header AKNA -->
          <div style="background: linear-gradient(135deg, #332980 0%, #1e1850 100%); padding: 32px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">AKNA<span style="color: #F19611;">.</span></h1>
            <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px;">Electric Mobility Platform</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 32px 28px;">
            <h2 style="margin: 0 0 14px 0; color: #332980; font-size: 21px;">Bienvenue, ${firstName} !</h2>
            <p style="margin: 0 0 20px 0; color: #444444; font-size: 14.5px; line-height: 1.6;">
              Votre compte pour accéder au portail opérateur <strong>AKNA Motors</strong> a été créé avec succès. Voici vos accès par défaut :
            </p>
            
            <!-- Credentials Box -->
            <div style="background-color: #f5f4fc; border-left: 4px solid #332980; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
              <div style="margin-bottom: 10px; font-size: 14px; color: #333;">
                <strong>Adresse e-mail :</strong> <span style="color: #332980; font-weight: 700;">${toEmail}</span>
              </div>
              <div style="margin-bottom: 10px; font-size: 14px; color: #333;">
                <strong>Mot de passe temporaire :</strong> <span style="font-family: monospace; background: #eae6fa; padding: 3px 8px; border-radius: 4px; color: #1e1850; font-weight: bold;">${initialPassword}</span>
              </div>
              <div style="margin-bottom: 10px; font-size: 14px; color: #333;">
                <strong>Rôle attribué :</strong> <span style="background: #FFF0DB; color: #D97706; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12.5px;">${role}</span>
              </div>
              <div style="font-size: 14px; color: #333;">
                <strong>Lien d'accès :</strong> <a href="http://localhost:3000" style="color: #F19611; font-weight: bold; text-decoration: none;">http://localhost:3000</a>
              </div>
            </div>

            <p style="margin: 0 0 24px 0; color: #555555; font-size: 13.5px; line-height: 1.5;">
              Une authentification à deux facteurs (2FA) par e-mail est activée sur votre compte pour sécuriser vos accès.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="http://localhost:3000" style="display: inline-block; background-color: #F19611; color: #ffffff; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 10px rgba(241,150,17,0.3);">
                Se connecter au Portail
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 16px; text-align: center; font-size: 11.5px; color: #999999;">
            © ${new Date().getFullYear()} AKNA Motors — Abidjan, Côte d'Ivoire. Tous droits réservés.
          </div>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject: `[AKNA Motors] Vos accès au portail opérateur AKNA`,
          html: htmlContent,
        });
        this.logger.log(`Email de bienvenue/accès envoyé avec succès à : ${toEmail}`);
        return true;
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email de bienvenue à ${toEmail}`, error);
      }
    }

    this.logger.warn(`[MAIL MOCK] Bienvenue pour ${toEmail} (${role}) — Password: ${initialPassword}`);
    return false;
  }
}
