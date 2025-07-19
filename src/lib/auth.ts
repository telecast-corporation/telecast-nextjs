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
      console.log('signIn callback triggered:', { user: user.email, provider: account?.provider });
      
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

                  if (!existingUser) {
          console.log('Creating new Google user:', user.email);
          // Create new user account for Google OAuth
          try {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: true, // Google accounts are pre-verified
              }
            });
            console.log('New user created successfully:', { id: newUser.id, email: newUser.email });
          } catch (createError) {
            console.error('Error creating user in database:', createError);
            throw createError;
          }
        } else {
            console.log('Updating existing Google user:', user.email);
            // Update existing user info if needed
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name,
                image: user.image,
                emailVerified: true, // Google accounts are pre-verified
              }
            });
          }
        } catch (error) {
          console.error('Error in Google signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('jwt callback triggered:', { userEmail: user?.email, tokenEmail: token.email, accountProvider: account?.provider });
      
      if (user) {
        // For Google OAuth, we need to get the database user ID
        if (account?.provider === 'google') {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! }
            });
            
            if (dbUser) {
              token.id = dbUser.id; // Use database user ID instead of OAuth provider ID
              console.log('Using database user ID for JWT:', dbUser.id);
            } else {
              console.error('Database user not found for email:', user.email);
              return token;
            }
          } catch (error) {
            console.error('Error finding database user:', error);
            return token;
          }
        } else {
          token.id = user.id;
        }
        
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        console.log('JWT token updated with user data:', { id: token.id, email: user.email });
      }
      return token;
    },
    async session({ session, token }) {
      console.log('session callback triggered:', { tokenEmail: token.email, sessionUser: session.user?.email });
      
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
            // Check if premium has expired
            const now = new Date();
            const isExpired = user.premiumExpiresAt && new Date(user.premiumExpiresAt) < now;
            
            // If premium has expired, update the database and session
            if (isExpired && user.isPremium) {
              await prisma.user.update({
                where: { email: token.email as string },
                data: {
                  isPremium: false,
                }
              });
              
              session.user.isPremium = false;
              session.user.premiumExpiresAt = user.premiumExpiresAt || undefined;
              session.user.usedFreeTrial = user.usedFreeTrial;
            } else {
              session.user.isPremium = user.isPremium;
              session.user.premiumExpiresAt = user.premiumExpiresAt || undefined;
              session.user.usedFreeTrial = user.usedFreeTrial;
            }
          }
        } catch (error) {
          console.error('Error loading user premium status:', error);
        }
      }
      console.log('Final session:', session);
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