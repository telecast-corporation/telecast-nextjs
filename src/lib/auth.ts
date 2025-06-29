import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error('No account found with this email address. Please sign up first.');
        }

        if (!user.password) {
          throw new Error('This email is associated with a Google account. Please use "Continue with Google" to sign in.');
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email address before signing in. Check your inbox for a verification link.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Incorrect password. Please try again.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
    CredentialsProvider({
      id: 'verification',
      name: 'verification',
      credentials: {
        email: { label: 'Email', type: 'email' },
        verificationToken: { label: 'Verification Token', type: 'text' }
      },
      async authorize(credentials) {
        console.log('🔍 Verification provider called with:', {
          email: credentials?.email,
          token: credentials?.verificationToken ? `${credentials.verificationToken.substring(0, 8)}...` : 'null'
        });

        if (!credentials?.email || !credentials?.verificationToken) {
          console.log('🔍 Missing email or token');
          return null;
        }

        // Verify the token and check if user is verified
        const verificationToken = await prisma.verificationToken.findUnique({
          where: { token: credentials.verificationToken },
        });

        console.log('🔍 Found verification token:', verificationToken ? 'yes' : 'no');
        if (verificationToken) {
          console.log('🔍 Token identifier:', verificationToken.identifier);
          console.log('🔍 Token expires:', verificationToken.expires);
          console.log('🔍 Is expired:', verificationToken.expires < new Date());
        }

        if (!verificationToken || verificationToken.identifier !== credentials.email) {
          console.log('🔍 Token not found or email mismatch');
          return null;
        }

        if (verificationToken.expires < new Date()) {
          console.log('🔍 Token expired');
          return null;
        }

        // Find the user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        console.log('🔍 Found user:', user ? 'yes' : 'no');
        if (user) {
          console.log('🔍 User email verified:', user.emailVerified);
        }

        if (!user || !user.emailVerified) {
          console.log('🔍 User not found or not verified');
          return null;
        }

        console.log('🔍 Verification successful, returning user');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });

        if (!existingUser) {
          // Redirect to signup page for new Google users
          return '/signup?error=Please sign up first before using Google login';
        }

        // Update user info if needed
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            name: user.name,
            image: user.image,
            emailVerified: true, // Google accounts are pre-verified
          }
        });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
} 