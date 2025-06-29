import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    console.log('🔍 Verification attempt with token:', token ? `${token.substring(0, 8)}...` : 'null');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Find and validate verification token
      const verificationToken = await tx.verificationToken.findUnique({
        where: { token },
      });

      console.log('🔍 Found verification token:', verificationToken ? 'yes' : 'no');
      if (verificationToken) {
        console.log('🔍 Token expires:', verificationToken.expires);
        console.log('🔍 Current time:', new Date());
        console.log('🔍 Is expired:', verificationToken.expires < new Date());
      }

      if (!verificationToken) {
        // Let's also check if there are any tokens in the database
        const allTokens = await tx.verificationToken.findMany({
          select: { token: true, identifier: true, expires: true }
        });
        console.log('🔍 All tokens in database:', allTokens.length);
        if (allTokens.length > 0) {
          console.log('🔍 Sample tokens:', allTokens.slice(0, 3).map(t => ({
            token: `${t.token.substring(0, 8)}...`,
            identifier: t.identifier,
            expires: t.expires
          })));
        }
        throw new Error('Invalid verification token');
      }

      if (verificationToken.expires < new Date()) {
        // Delete expired token
        await tx.verificationToken.delete({
          where: { token },
        });
        throw new Error('Verification token has expired');
      }

      // Update user to verified
      const user = await tx.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: true },
      });

      // Don't delete the token yet - let the frontend handle it after auto-login
      console.log('🔍 User verified, token kept for auto-login');

      return { user, verificationToken };
    });

    console.log('✅ Verification successful for user:', result.user.email);

    return NextResponse.json({
      message: 'Email verified successfully. You are now logged in.',
      user: { 
        email: result.user.email, 
        name: result.user.name,
        emailVerified: true 
      },
      autoLogin: true,
      token: result.verificationToken.token, // Return the token for auto-login
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    // Handle specific error cases
    if (error.message === 'Invalid verification token') {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }
    
    if (error.message === 'Verification token has expired') {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 