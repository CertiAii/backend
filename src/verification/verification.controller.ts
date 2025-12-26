import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerificationService } from './verification.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CertificateType } from '@prisma/client';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  /**
   * Upload certificate for verification
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only JPG, PNG, and PDF are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadCertificate(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('certificateType') certificateType: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (
      !certificateType ||
      !Object.values(CertificateType).includes(
        certificateType as CertificateType,
      )
    ) {
      throw new BadRequestException('Invalid certificate type');
    }

    const verification = await this.verificationService.uploadCertificate(
      req.user.id,
      file,
      certificateType as CertificateType,
    );

    return {
      success: true,
      message: 'Certificate uploaded successfully',
      data: verification,
    };
  }

  /**
   * Get verification history
   */
  @Get('history')
  async getHistory(
    @Req() req,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.verificationService.getVerificationHistory(
      req.user.userId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 10,
    );

    return {
      success: true,
      message: 'Verification history retrieved successfully',
      data: result,
    };
  }

  /**
   * Get verification by ID
   */
  @Get(':id')
  async getVerification(@Req() req, @Param('id') id: string) {
    const verification = await this.verificationService.getVerificationById(
      id,
      req.user.userId,
    );

    return {
      success: true,
      message: 'Verification retrieved successfully',
      data: verification,
    };
  }

  /**
   * Get dashboard statistics
   */
  @Get('dashboard/stats')
  async getDashboardStats(@Req() req) {
    const stats = await this.verificationService.getDashboardStats(
      req.user.userId,
    );

    return {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Delete verification
   */
  @Delete(':id')
  async deleteVerification(@Req() req, @Param('id') id: string) {
    const result = await this.verificationService.deleteVerification(
      id,
      req.user.userId,
    );

    return {
      success: true,
      message: result.message,
      data: null,
    };
  }
}
