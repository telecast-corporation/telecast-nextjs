'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0';
import { AuthProvider } from '@/contexts/AuthContext';

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <AuthProvider>{children}</AuthProvider>
    </Auth0Provider>
  );
} 