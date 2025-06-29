import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, name, image } = await request.json();

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user with Google OAuth data
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        image,
        emailVerified: true, // Google accounts are pre-verified
      },
    });

    return NextResponse.json({
      message: 'Google account created successfully. You can now sign in.',
      user: { 
        id: newUser.id,
        email: newUser.email, 
        name: newUser.name,
        image: newUser.image 
      },
    });
  } catch (error) {
    console.error('Google signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 