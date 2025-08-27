'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0';
import { AuthProvider } from '@/contexts/AuthContext';
import { SnackbarProvider } from 'notistack';

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <AuthProvider>
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {children}
        </SnackbarProvider>
      </AuthProvider>
    </Auth0Provider>
  );
} 