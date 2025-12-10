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

export async function getOrCreateUserById(auth0Id: string | undefined): Promise<Auth0User | null> {
  if (!auth0Id) {
    console.error("No Auth0 ID provided to getOrCreateUserById.");
    return null;
  }

  try {
    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { auth0Id }
    });

    // If user doesn't exist, create them
    // Note: When calling this from the client, `email`, `name`, `picture`
    // might not be directly available unless passed. For now, we'll
    // fetch them from the session if needed, or assume they are passed
    // or handle nulls. A more robust solution might pass more user data.
    if (!user) {
        // Here you might need to fetch more user details from Auth0
        // or ensure they are passed as arguments if available.
        // For simplicity, let's assume we create with minimal info
        // and fill in later, or you pass them as parameters to this function.
        // For a more complete solution, you might consider getting the full
        // Auth0 profile here if the user doesn't exist in your DB.
        console.warn(`User with Auth0 ID ${auth0Id} not found in DB. Creating with minimal info.`);
        user = await prisma.user.create({
            data: {
                auth0Id,
                email: null, // You might need to retrieve this from Auth0 if not passed
                name: null,  // You might need to retrieve this from Auth0 if not passed
                image: null, // You might need to retrieve this from Auth0 if not passed
                isPremium: false,
                usedFreeTrial: false,
            },
        });
    }

    return user;
  } catch (error) {
    console.error('Error getting or creating user by Auth0 ID:', error);
    return null;
  }
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