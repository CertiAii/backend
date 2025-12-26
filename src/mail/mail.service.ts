import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailtrapClient } from 'mailtrap';

@Injectable()
export class MailService {
  private mailtrap: MailtrapClient;
  private fromEmail: string;

  constructor(private config: ConfigService) {
    this.mailtrap = new MailtrapClient({
      token: this.config.get<string>('MAILTRAP_API_TOKEN'),
    });
    this.fromEmail =
      this.config.get<string>('MAILTRAP_FROM_EMAIL') || 'hello@certiai.com';
  }

  async sendVerificationEmail(email: string, code: string) {
    try {
      console.log('📧 Attempting to send verification email to:', email);
      console.log('📧 From:', this.fromEmail);
      console.log(
        '📧 API Token configured:',
        this.config.get<string>('MAILTRAP_API_TOKEN') ? 'Yes' : 'No',
      );

      const result = await this.mailtrap.send({
        from: { email: this.fromEmail, name: 'CertiAI' },
        to: [{ email }],
        subject: 'Verify your email - CertiAI',
        html: this.verificationTemplate(code),
      });

      console.log(
        '✅ Email sent successfully! Result:',
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, code: string) {
    try {
      console.log('📧 Attempting to send password reset email to:', email);

      const result = await this.mailtrap.send({
        from: { email: this.fromEmail, name: 'CertiAI' },
        to: [{ email }],
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
