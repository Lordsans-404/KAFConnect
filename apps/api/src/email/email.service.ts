import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  generateVerificationToken(): string {
    return crypto.randomBytes(20).toString('hex');
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/users/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: '"KAFConnect Admin" <no-reply@kafconnect.com>',
        to: email,
        subject: 'Verify Your Email',
        html: `Click <a href="${verifyUrl}">here</a> to verify your email.`,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}