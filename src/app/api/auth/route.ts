import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign, verify } from 'jsonwebtoken';

// This would typically come from your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock user database - replace with actual database in production
const users: { [key: string]: { username: string; email: string; password: string } } = {};

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { action, username, email, password } = await request.json();

    if (action === 'signup') {
      // Check if user already exists
      if (users[email]) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }

      // Create new user
      users[email] = {
        username,
        email,
        password, // In production, hash the password before storing
      };

      // Generate JWT token
      const token = sign({ email, username }, JWT_SECRET, { expiresIn: '24h' });

      // Set cookie with secure options
      cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/', // Ensure cookie is available across all paths
      });

      return NextResponse.json({
        message: 'User created successfully',
        user: { username, email },
      });
    }

    if (action === 'login') {
      // Check if user exists
      const user = users[email];
      if (!user || user.password !== password) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = sign({ email, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

      // Set cookie with secure options
      cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/', // Ensure cookie is available across all paths
      });

      return NextResponse.json({
        message: 'Login successful',
        user: { username: user.username, email },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      // If token is invalid, clear the cookie
      cookies().delete('token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Return user data from decoded token
    return NextResponse.json({
      message: 'Authenticated',
      user: decoded,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Clear the auth cookie
  cookies().delete('token');
  return NextResponse.json({ message: 'Logged out successfully' });
} 