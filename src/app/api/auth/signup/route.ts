import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

// This would typically come from your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
      },
    });

    if (user) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email verification is enabled
    const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION === 'true';
    
    let result;
    let verificationToken = '';
    
    if (emailVerificationEnabled) {
      // Generate verification token
      verificationToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new user and verification token in a transaction
      result = await prisma.$transaction(async (tx) => {
        // Create user (not verified)
        const user = await tx.user.create({
          data: {
            name: username,
            email,
            password: hashedPassword,
            emailVerified: false,
          },
        });

        // Create verification token
        await tx.verificationToken.create({
          data: {
            identifier: email,
            token: verificationToken,
            expires,
          },
        });

        return user;
      });

      // Try to send verification email, but don't fail if it doesn't work
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with signup process even if email fails
      }
    } else {
      // Create user without email verification (but keep emailVerified as false)
      // This allows enabling verification later for these users
      result = await prisma.user.create({
        data: {
          name: username,
          email,
          password: hashedPassword,
             emailVerified: false, // Keep as false for future verification capability
        },
      });
    }

    const message = emailVerificationEnabled 
      ? 'Account created successfully. Please check your email to verify your account.'
      : 'Account created successfully. You can now log in.';

    return NextResponse.json({
      message,
      user: { username, email },
      emailVerificationRequired: emailVerificationEnabled,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 