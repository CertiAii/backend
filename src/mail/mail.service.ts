import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(private config: ConfigService) {
    // Check if Gmail SMTP is configured, otherwise use Mailtrap
    const gmailUser = this.config.get<string>('GMAIL_USER');
    const gmailAppPassword = this.config.get<string>('GMAIL_APP_PASSWORD');

    if (gmailUser && gmailAppPassword) {
      // Gmail SMTP configuration with port 465 (SSL) for Railway compatibility
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });
      this.fromEmail = gmailUser;
      console.log('📧 Using Gmail SMTP (port 465) for email delivery');
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
      console.log('📧 Using Mailtrap for email testing');
    }
  }

  async sendVerificationEmail(email: string, code: string) {
    try {
      console.log('📧 Attempting to send verification email to:', email);
      console.log('📧 From:', this.fromEmail);

      const result = await this.transporter.sendMail({
        from: `"CertiAI" <${this.fromEmail}>`,
        to: email,
        subject: 'Verify your email - CertiAI',
        html: this.verificationTemplate(code),
      });

      console.log('✅ Email sent successfully! Message ID:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, code: string) {
    try {
      console.log('📧 Attempting to send password reset email to:', email);

      const result = await this.transporter.sendMail({
        from: `"CertiAI" <${this.fromEmail}>`,
        to: email,
        subject: 'Reset your password - CertiAI',
        html: this.passwordResetTemplate(code),
      });

      console.log('✅ Password reset email sent successfully!');
      return result;
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
