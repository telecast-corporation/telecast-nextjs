import nodemailer from 'nodemailer';

// Only create transporter and verify connection if email verification is enabled
let transporter: nodemailer.Transporter | null = null;

if (process.env.ENABLE_EMAIL_VERIFICATION === 'true') {
  // Create reusable transporter object using custom SMTP server
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'snowdon.whc.ca',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: process.env.NODE_ENV === 'development',
  });

  // Verify SMTP connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error('SMTP Configuration Error:', error);
    } else {
      console.log('SMTP Server is ready to take our messages');
    }
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  // Check if email verification is enabled
  if (process.env.ENABLE_EMAIL_VERIFICATION !== 'true') {
    console.log('Email verification is disabled. Skipping email send.');
    return { messageId: 'skipped-verification-disabled' };
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration is missing. Skipping email verification.');
    return { messageId: 'skipped-no-smtp-config' };
  }

  if (!transporter) {
    console.error('SMTP transporter not initialized. Email verification may be disabled.');
    return { messageId: 'skipped-no-transporter' };
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

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

    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
} 