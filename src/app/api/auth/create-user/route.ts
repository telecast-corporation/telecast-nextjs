import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auth0Id, email, name, picture } = body;

    console.log('Create user request received:', {
      auth0Id,
      email,
      name,
      hasPicture: !!picture
    });

    if (!auth0Id) {
      console.error('Missing auth0Id in request');
      return NextResponse.json(
        { error: 'Auth0 ID is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking if user exists with auth0Id:', auth0Id);
    const existingUser = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (existingUser) {
      console.log('User already exists:', {
        id: existingUser.id,
        auth0Id: existingUser.auth0Id,
        email: existingUser.email
      });
      return NextResponse.json(existingUser);
    }

    // Create new user
    console.log('Creating new user with data:', {
      auth0Id,
      email,
      name,
      hasPicture: !!picture
    });

    const user = await prisma.user.create({
      data: {
        auth0Id,
        email,
        name,
        image: picture,
        isPremium: false,
        usedFreeTrial: false,
      },
    });

    console.log('User created successfully:', {
      id: user.id,
      auth0Id: user.auth0Id,
      email: user.email,
      name: user.name
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Request body:', await req.text().catch(() => 'Could not read request body'));
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
} 