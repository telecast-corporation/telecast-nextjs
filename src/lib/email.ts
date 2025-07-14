import nodemailer from 'nodemailer';

// Only create transporter and verify connection if email verification is enabled
let transporter: nodemailer.Transporter | null = null;

if (process.env.ENABLE_EMAIL_VERIFICATION === 'true') {
  // Create reusable transporter object using custom SMTP server
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.telecast.ca',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: process.env.NODE_ENV === 'development',
  });

  // Verify SMTP connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      // SMTP Configuration Error
    } else {
      // SMTP Server is ready to take our messages
    }
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  // Check if email verification is enabled
  if (process.env.ENABLE_EMAIL_VERIFICATION !== 'true') {
    return { messageId: 'skipped-verification-disabled' };
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { messageId: 'skipped-no-smtp-config' };
  }

  if (!transporter) {
    return { messageId: 'skipped-no-transporter' };
  }

  // Get base URL from environment variables or construct it
  const baseUrl = process.env.NEXTAUTH_URL || 
                  process.env.NEXT_PUBLIC_BASE_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://telecast.ca' 
                    : 'http://localhost:3000');
  
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to Telecast!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return info;
  } catch (error) {
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  // Check if email verification is enabled
  if (process.env.ENABLE_EMAIL_VERIFICATION !== 'true') {
    return { messageId: 'skipped-verification-disabled' };
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { messageId: 'skipped-no-smtp-config' };
  }

  if (!transporter) {
    return { messageId: 'skipped-no-transporter' };
  }

  // Get base URL from environment variables or construct it
  const baseUrl = process.env.NEXTAUTH_URL || 
                  process.env.NEXT_PUBLIC_BASE_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://telecast.ca' 
                    : 'http://localhost:3000');
  
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return info;
  } catch (error) {
    throw error;
  }
}

export async function sendAccountDeletionEmail(email: string, name: string) {
  // Check if email verification is enabled
  if (process.env.ENABLE_EMAIL_VERIFICATION !== 'true') {
    return { messageId: 'skipped-verification-disabled' };
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { messageId: 'skipped-no-smtp-config' };
  }

  if (!transporter) {
    return { messageId: 'skipped-no-transporter' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your account has been deleted',
      html: `
        <h1>Account Deletion Confirmation</h1>
        <p>Dear ${name},</p>
        <p>Your account has been successfully deleted from Telecast.</p>
        <p>We're sorry to see you go. If you change your mind, you can always create a new account.</p>
        <p>Thank you for being part of our community.</p>
        <p>Best regards,<br>The Telecast Team</p>
      `,
    });

    return info;
  } catch (error) {
    throw error;
  }
} 