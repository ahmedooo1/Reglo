import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter() {
    if (!process.env.SMTP_HOST) return null;
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendVerificationEmail(params: { to: string; verifyUrl: string }) {
    const transporter = this.getTransporter();
    if (!transporter) return;

    const html = `
      <!doctype html>
      <html lang="fr">
      <head><meta charset="utf-8" /></head>
      <body>
      <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #14171F;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #2A3B8F; margin: 0 0 12px;">Reglo</p>
        <h1 style="font-size: 22px; margin: 0 0 16px;">Confirmez votre adresse email</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 24px;">
          Bienvenue sur Reglo ! Cliquez sur le bouton ci-dessous pour activer votre compte.
        </p>
        <a href="${params.verifyUrl}" style="display: inline-block; background: #2A3B8F; color: #fff; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-size: 14px;">
          Confirmer mon email
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #999; word-break: break-all;">${params.verifyUrl}</p>
      </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: params.to,
        subject: 'Confirmez votre adresse email - Reglo',
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${params.to}`, err as Error);
    }
  }

  async sendPasswordResetEmail(params: { to: string; resetUrl: string }) {
    const transporter = this.getTransporter();
    if (!transporter) return;

    const html = `
      <!doctype html>
      <html lang="fr">
      <head><meta charset="utf-8" /></head>
      <body>
      <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #14171F;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #2A3B8F; margin: 0 0 12px;">Reglo</p>
        <h1 style="font-size: 22px; margin: 0 0 16px;">Réinitialisez votre mot de passe</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 24px;">
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
        </p>
        <a href="${params.resetUrl}" style="display: inline-block; background: #2A3B8F; color: #fff; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-size: 14px;">
          Choisir un nouveau mot de passe
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #999; word-break: break-all;">${params.resetUrl}</p>
      </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: params.to,
        subject: 'Réinitialisation de votre mot de passe - Reglo',
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${params.to}`, err as Error);
    }
  }
}
