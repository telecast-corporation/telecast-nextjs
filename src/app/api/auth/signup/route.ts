import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

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
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔍 Generated verification token:', `${verificationToken.substring(0, 8)}...`);
    console.log('🔍 Token expires:', expires);

      // Create new user and verification token in a transaction
    const result = await prisma.$transaction(async (tx) => {
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

      console.log('🔍 Stored verification token in database for:', email);

        return user;
      });

    // Send verification email
      try {
      console.log('🔍 Sending verification email with token:', `${verificationToken.substring(0, 8)}...`);
        await sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with signup process even if email fails
      }

    return NextResponse.json({
      message: 'Account created successfully. Please check your email to verify your account.',
      user: { username, email },
      emailVerificationRequired: true,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 