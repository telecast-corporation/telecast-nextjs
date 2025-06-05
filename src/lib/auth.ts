import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Create or update user in database
      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          image: user.image,
        },
        create: {
          email: user.email,
          name: user.name,
          image: user.image,
        },
      });

      // Set the user ID to our database ID
      user.id = dbUser.id;
      return true;
    },
    async session({ session, token }) {
      console.log('Session callback - Token:', token);
      console.log('Session callback - Session:', session);
      
      if (session.user) {
        session.user.id = token.sub || token.id as string;
        console.log('Updated session user:', session.user);
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback - Token:', token);
      console.log('JWT callback - User:', user);
      console.log('JWT callback - Account:', account);
      
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}; 