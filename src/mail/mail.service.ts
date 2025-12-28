import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private resend: Resend;
  private fromEmail: string;
  private useResend: boolean;

  constructor(private config: ConfigService) {
    const resendApiKey = this.config.get<string>('RESEND_API_KEY');
    const gmailUser = this.config.get<string>('GMAIL_USER');
    const gmailAppPassword = this.config.get<string>('GMAIL_APP_PASSWORD');

    // Prioritize Resend (HTTP-based) for Railway deployment
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.fromEmail =
        this.config.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
      this.useResend = true;
      console.log(
        '📧 Using Resend (HTTP API) for email delivery - Railway compatible',
      );
    }
    // Fallback to Gmail SMTP for local development
    else if (gmailUser && gmailAppPassword) {
      // Gmail SMTP configuration with port 587 (STARTTLS) - works locally
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      this.fromEmail = gmailUser;
      this.useResend = false;
      console.log(
        '📧 Using Gmail SMTP (port 587) for email delivery - Local only',
      );
    } else {
      // Fallback to Mailtrap for testing
      const mailtrapHost =
        this.config.get<string>('MAILTRAP_HOST') || 'smtp.mailtrap.io';
      const mailtrapPort = parseInt(
        this.config.get<string>('MAILTRAP_PORT') || '2525',
      );
      const mailtrapUser = this.config.get<string>('MAILTRAP_USER');
      const mailtrapPass = this.config.get<string>('MAILTRAP_PASS');

      this.transporter = nodemailer.createTransport({
        host: mailtrapHost,
        port: mailtrapPort,
        auth: {
          user: mailtrapUser,
          pass: mailtrapPass,
        },
      });
      this.fromEmail =
        this.config.get<string>('FROM_EMAIL') || 'hello@certiai.com';
      this.useResend = false;
      console.log('📧 Using Mailtrap SMTP for email testing');
    }
  }

  async sendVerificationEmail(email: string, code: string) {
    try {
      console.log('📧 Attempting to send verification email to:', email);
      console.log('📧 From:', this.fromEmail);

      if (this.useResend) {
        // Resend HTTP API (works on Railway)
        const result = await this.resend.emails.send({
          from: this.fromEmail,
          to: email,
          subject: 'Verify your email - CertiAI',
          html: this.verificationTemplate(code),
        });
        console.log('✅ Email sent via Resend! ID:', result.data?.id);
        return result;
      } else {
        // SMTP (nodemailer)
        const result = await this.transporter.sendMail({
          from: `"CertiAI" <${this.fromEmail}>`,
          to: email,
          subject: 'Verify your email - CertiAI',
          html: this.verificationTemplate(code),
        });
        console.log('✅ Email sent via SMTP! Message ID:', result.messageId);
        return result;
      }
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, code: string) {
    try {
      console.log('📧 Attempting to send password reset email to:', email);

      if (this.useResend) {
        // Resend HTTP API (works on Railway)
        const result = await this.resend.emails.send({
          from: this.fromEmail,
          to: email,
          subject: 'Reset your password - CertiAI',
          html: this.passwordResetTemplate(code),
        });
        console.log('✅ Password reset email sent via Resend!');
        return result;
      } else {
        // SMTP (nodemailer)
        const result = await this.transporter.sendMail({
          from: `"CertiAI" <${this.fromEmail}>`,
          to: email,
          subject: 'Reset your password - CertiAI',
          html: this.passwordResetTemplate(code),
        });
        console.log('✅ Password reset email sent via SMTP!');
        return result;
      }
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  private verificationTemplate(code: string): string {
    return `
      <html>
        <body style="font-family: Arial; background:#f9f9f9; padding:20px">
          <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px;padding:30px">
            <h2>Verify your email</h2>
            <p>Your verification code:</p>
            <h1 style="letter-spacing:8px">${code}</h1>
            <p>This code expires in 10 minutes.</p>
            <small>If you didn’t sign up, ignore this email.</small>
          </div>
        </body>
      </html>
    `;
  }

  private passwordResetTemplate(code: string): string {
    return `
      <html>
        <body style="font-family: Arial; background:#f9f9f9; padding:20px">
          <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px;padding:30px">
            <h2>Password Reset</h2>
            <p>Your reset code:</p>
            <h1 style="letter-spacing:8px">${code}</h1>
            <p>This code expires in 10 minutes.</p>
            <small>If you didn’t request this, ignore this email.</small>
          </div>
        </body>
      </html>
    `;
  }
}
