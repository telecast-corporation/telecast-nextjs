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
        if (!credentials?.email || !credentials?.verificationToken) {
          return null;
        }

        // Verify the token and check if user is verified
        const verificationToken = await prisma.verificationToken.findUnique({
          where: { token: credentials.verificationToken },
        });

        if (!verificationToken || verificationToken.identifier !== credentials.email) {
          return null;
        }

        if (verificationToken.expires < new Date()) {
          return null;
        }

        // Find the user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.emailVerified) {
          return null;
        }
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
        
        // Load the latest user data from database including premium status
        try {
          const user = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              isPremium: true,
              premiumExpiresAt: true,
              usedFreeTrial: true,
            }
          });
          
          if (user) {
            session.user.isPremium = user.isPremium;
            session.user.premiumExpiresAt = user.premiumExpiresAt || undefined;
            session.user.usedFreeTrial = user.usedFreeTrial;
          }
        } catch (error) {
          // Error loading user premium status
        }
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