import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Delete the verification token
    try {
      await prisma.verificationToken.delete({
        where: { token },
      });
      console.log('🔍 Verification token cleaned up successfully');
    } catch (deleteError) {
      // Token might already be deleted, that's fine
      console.log('🔍 Token was already deleted or not found');
    }

    return NextResponse.json({
      success: true,
      message: 'Token cleaned up successfully',
    });
  } catch (error) {
    console.error('Cleanup verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 