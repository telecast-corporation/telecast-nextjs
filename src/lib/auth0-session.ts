import { NextRequest } from 'next/server';
import auth0 from './auth0';

export interface Auth0User {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function getAuth0Session(req: NextRequest) {
  try {
    const session = await auth0.getSession(req);
    return session;
  } catch (error) {
    console.error('Error getting Auth0 session:', error);
    return null;
  }
}

export async function getAuth0User(req: NextRequest): Promise<Auth0User | null> {
  const session = await getAuth0Session(req);
  return session?.user || null;
}

export async function requireAuth(req: NextRequest): Promise<Auth0User> {
  const user = await getAuth0User(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
} 