import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      isPremium?: boolean;
      premiumExpiresAt?: Date;
      usedFreeTrial?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isPremium?: boolean;
    premiumExpiresAt?: Date;
    usedFreeTrial?: boolean;
  }
} 