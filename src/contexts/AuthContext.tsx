'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isPremium?: boolean;
  premiumExpiresAt?: Date;
  usedFreeTrial?: boolean;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (provider?: 'google' | 'credentials', credentials?: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: { username: string; email: string; password: string }) => Promise<{ success: boolean; message: string }>;
  googleSignup: (userData: { email: string; name: string; image?: string }) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: auth0User, error, isLoading: auth0Loading } = useUser();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (auth0Loading) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
    } else if (auth0User) {
      setAuthState({
        user: {
          id: auth0User.sub || '',
          name: auth0User.name || '',
          email: auth0User.email || '',
          image: auth0User.picture,
          isPremium: auth0User['https://telecast.com/premium'] || false,
          premiumExpiresAt: auth0User['https://telecast.com/premium_expires_at'] ? new Date(auth0User['https://telecast.com/premium_expires_at']) : undefined,
          usedFreeTrial: auth0User['https://telecast.com/used_free_trial'] || false,
          isAdmin: auth0User['https://telecast.com/roles']?.includes('admin') || false,
        },
            isLoading: false,
            isAuthenticated: true,
        });
      } else {
        setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [auth0User, auth0Loading]);

  // Memoize functions to prevent unnecessary re-renders
  const login = useCallback(async (provider?: 'google' | 'credentials', credentials?: { email: string; password: string }) => {
    try {
      // For Auth0, we redirect to the login endpoint
      if (provider === 'google') {
        // Redirect to Auth0 with Google connection
        window.location.href = '/auth/login?connection=google-oauth2';
      } else {
        // Redirect to Auth0 login page
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Redirect to Auth0 logout endpoint
      // Let Auth0 handle the session cleanup and state update
      window.location.href = '/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const signup = useCallback(async (userData: { username: string; email: string; password: string }) => {
    try {
      // Use Auth0's built-in signup flow with redirect
      window.location.href = '/auth/login?screen_hint=signup&returnTo=%2F';
      return { success: true, message: 'Redirecting to signup...' };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Signup failed' 
      };
    }
  }, []);

  const googleSignup = useCallback(async (userData: { email: string; name: string; image?: string }) => {
    try {
      // Use Auth0's built-in Google signup flow with redirect
      window.location.href = '/auth/login?connection=google-oauth2&screen_hint=signup&returnTo=%2F';
      return { success: true, message: 'Redirecting to Google signup...' };
    } catch (error) {
      console.error('Google signup error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Google signup failed' 
      };
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    signup,
    googleSignup,
  }), [authState.user, authState.isLoading, authState.isAuthenticated, login, logout, signup, googleSignup]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
