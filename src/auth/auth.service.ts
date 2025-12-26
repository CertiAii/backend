import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  private generateCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate 5-digit verification code
    const verificationCode = this.generateCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        institutionName: dto.institutionName,
        role: dto.role,
        verificationCode,
        verificationCodeExpiry,
      },
    });

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationCode,
      );
      console.log(`✅ Verification email sent to ${user.email}`);
      console.log(`🔑 Verification Code (DEV ONLY): ${verificationCode}`);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      console.log(`🔑 Verification Code (DEV ONLY): ${verificationCode}`);
    }

    delete user.password;
    return {
      message:
        'Registration successful. Please check your email for the verification code.',
      user,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    delete user.password;
    return {
      user,
      ...tokens,
    };
  }

  async verifyEmail(code: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationCode: code,
        verificationCodeExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        message:
          'If your email is registered, you will receive a password reset code.',
      };
    }

    // Generate 5-digit reset code
    const resetCode = this.generateCode();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode,
        resetCodeExpiry,
      },
    });

    // Send reset email
    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetCode);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return {
      message:
        'If your email is registered, you will receive a password reset code.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetCode: dto.code,
        resetCodeExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;
    return user;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRATION') || '7d',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }
}
