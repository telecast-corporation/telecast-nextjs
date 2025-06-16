'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<{
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  }>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  // Update auth state when session changes (optimized version without excessive logging)
  useEffect(() => {
    if (status === 'loading') {
      setAuthState(prev => prev.isLoading ? prev : {
        ...prev,
        isLoading: true,
        isAuthenticated: false,
      });
    } else if (status === 'authenticated' && session?.user) {
      // Ensure we have all required user fields
      if (session.user.id && session.user.name && session.user.email) {
        const user = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        };
        setAuthState(prev => {
          // Only update if user data has changed
          if (prev.user?.id === user.id && prev.isAuthenticated) {
            return prev;
          }
          return {
            user,
            isLoading: false,
            isAuthenticated: true,
          };
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } else {
      setAuthState(prev => prev.isAuthenticated === false && !prev.isLoading ? prev : {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [session, status]);

  // Memoize functions to prevent unnecessary re-renders
  const login = useCallback(async () => {
    try {
      const result = await signIn('google', { 
        callbackUrl: window.location.href,
        redirect: false 
      });
      
      if (result?.error) {
        console.error('Login error:', result.error);
      }
      // Don't manually redirect - let NextAuth handle it
    } catch (error) {
      console.error('Login error:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ callbackUrl: '/' });
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
  }), [authState.user, authState.isLoading, authState.isAuthenticated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 