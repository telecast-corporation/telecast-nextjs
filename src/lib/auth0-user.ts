import { NextRequest } from 'next/server';
import { getAuth0Session } from './auth0-session';
import { prisma } from './prisma';

export interface Auth0User {
  id: string;
  auth0Id: string | null;
  email: string | null;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  usedFreeTrial: boolean;
}

/**
 * Get or create a user from the database based on Auth0 session
 */
export async function getOrCreateUser(req: NextRequest): Promise<Auth0User | null> {
  try {
    const session = await getAuth0Session(req);
    if (!session?.user) {
      return null;
    }

    const auth0Id = session.user.sub;
    const email = session.user.email;
    const name = session.user.name;
    const picture = session.user.picture;

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { auth0Id }
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          auth0Id,
          email,
          name,
          image: picture,
          isPremium: false,
          usedFreeTrial: false,
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Error getting or creating user:', error);
    return null;
  }
}

/**
 * Get user from database by Auth0 ID
 */
export async function getUserByAuth0Id(auth0Id: string): Promise<Auth0User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id }
    });
    return user;
  } catch (error) {
    console.error('Error getting user by Auth0 ID:', error);
    return null;
  }
}

/**
 * Get user from request (legacy function for compatibility)
 */
export async function getUserFromRequest(req: NextRequest): Promise<Auth0User | null> {
  return getOrCreateUser(req);
} 