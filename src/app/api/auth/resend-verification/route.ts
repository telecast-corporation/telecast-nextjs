import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email verification is enabled
    if (process.env.ENABLE_EMAIL_VERIFICATION !== 'true') {
      return NextResponse.json(
        { error: 'Email verification is not enabled' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete existing tokens and create new one
    await prisma.$transaction(async (tx) => {
      // Delete existing verification tokens for this email
      await tx.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Create new verification token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires,
        },
      });
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      return NextResponse.json({
        message: 'Verification email sent successfully',
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 