import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificateType, VerificationStatus } from '@prisma/client';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import axios from 'axios';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upload and create verification record
   */
  async uploadCertificate(
    userId: string,
    file: Express.Multer.File,
    certificateType: CertificateType,
  ) {
    // Create verification record
    const verification = await this.prisma.verification.create({
      data: {
        userId,
        certificateType,
        fileName: file.originalname,
        fileUrl: file.path,
        fileSize: file.size,
        fileMimeType: file.mimetype,
        status: VerificationStatus.PENDING,
      },
    });

    // Start async verification process (simulated for now)
    this.processVerification(verification.id).catch((err) =>
      console.error('Verification processing error:', err),
    );

    return verification;
  }

  /**
   * Process certificate verification using ML service
   */
  private async processVerification(verificationId: string) {
    const startTime = Date.now();

    try {
      // Update to PROCESSING
      await this.prisma.verification.update({
        where: { id: verificationId },
        data: { status: VerificationStatus.PROCESSING },
      });

      // Get verification details
      const verification = await this.prisma.verification.findUnique({
        where: { id: verificationId },
      });

      if (!verification) {
        throw new Error('Verification not found');
      }

      // Prepare form data for ML service
      const form = new FormData();
      form.append('file', fsSync.createReadStream(verification.fileUrl));
      form.append('certificate_type', verification.certificateType);

      // Call ML service
      const mlServiceUrl =
        process.env.ML_SERVICE_URL || 'http://localhost:5000';
      const mlResponse = await axios.post(`${mlServiceUrl}/verify`, form, {
        headers: form.getHeaders(),
        timeout: 30000, // 30 seconds
      });

      const { confidence, authenticity, details } = mlResponse.data;

      const analysisResult = {
        confidence,
        authenticity,
        details,
        timestamp: new Date().toISOString(),
      };

      const processingTime = Date.now() - startTime;

      // Map ML response to our status enum
      let status: VerificationStatus;
      if (authenticity === 'AUTHENTIC') {
        status = VerificationStatus.AUTHENTIC;
      } else if (authenticity === 'SUSPICIOUS') {
        status = VerificationStatus.SUSPICIOUS;
      } else {
        status = VerificationStatus.FORGED;
      }

      // Update with ML results
      await this.prisma.verification.update({
        where: { id: verificationId },
        data: {
          status,
          confidenceScore: confidence,
          analysisResult,
          processingTime,
        },
      });

      console.log(
        `✅ Verification ${verificationId} completed: ${status} (${confidence.toFixed(2)}%)`,
      );
    } catch (error) {
      const errorMessage =
        error.code === 'ECONNREFUSED'
          ? 'ML service unavailable'
          : error.message;

      await this.prisma.verification.update({
        where: { id: verificationId },
        data: {
          status: VerificationStatus.FORGED,
          errorMessage,
          processingTime: Date.now() - startTime,
        },
      });

      console.error('Verification processing failed:', error.message);
    }
  }

  /**
   * Get verification history for a user
   */
  async getVerificationHistory(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [verifications, total] = await Promise.all([
      this.prisma.verification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.verification.count({ where: { userId } }),
    ]);

    return {
      verifications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get verification by ID
   */
  async getVerificationById(id: string, userId: string) {
    const verification = await this.prisma.verification.findFirst({
      where: { id, userId },
    });

    if (!verification) {
      throw new Error('Verification not found');
    }

    return verification;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string) {
    // Run queries sequentially to avoid exhausting DB connection pool
    const total = await this.prisma.verification.count({ where: { userId } });
    const authentic = await this.prisma.verification.count({
      where: { userId, status: VerificationStatus.AUTHENTIC },
    });
    const suspicious = await this.prisma.verification.count({
      where: { userId, status: VerificationStatus.SUSPICIOUS },
    });
    const forged = await this.prisma.verification.count({
      where: { userId, status: VerificationStatus.FORGED },
    });
    const recent = await this.prisma.verification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      totalVerified: total,
      authentic,
      suspicious,
      forged,
      pending: total - (authentic + suspicious + forged),
      recentVerifications: recent,
    };
  }

  /**
   * Delete verification
   */
  async deleteVerification(id: string, userId: string) {
    const verification = await this.prisma.verification.findFirst({
      where: { id, userId },
    });

    if (!verification) {
      throw new Error('Verification not found');
    }

    // Delete file from filesystem
    try {
      await fs.unlink(verification.fileUrl);
    } catch (err) {
      console.error('Failed to delete file:', err);
    }

    // Delete from database
    await this.prisma.verification.delete({ where: { id } });

    return { message: 'Verification deleted successfully' };
  }
}
