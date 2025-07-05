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
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (status === 'loading') {
      setAuthState(prev => ({ ...prev, isLoading: true }));
    } else if (session?.user) {
      setAuthState({
        user: {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image,
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
  }, [session, status]);

  // Memoize functions to prevent unnecessary re-renders
  const login = useCallback(async (provider: 'google' | 'credentials' = 'google', credentials?: { email: string; password: string }) => {
    try {
      if (provider === 'credentials' && credentials) {
        const result = await signIn('credentials', {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
      });
      
      if (result?.error) {
          // Handle specific error messages from the credentials provider
          if (result.error.includes('No account found')) {
            throw new Error('No account found with this email address. Please sign up first.');
          } else if (result.error.includes('Google account')) {
            throw new Error('This email is associated with a Google account. Please use "Continue with Google" to sign in.');
          } else if (result.error.includes('Incorrect password')) {
            throw new Error('Incorrect password. Please try again.');
          } else if (result.error.includes('Email and password are required')) {
            throw new Error('Please enter both email and password.');
          } else {
            throw new Error(result.error);
          }
        }
      } else {
        // For Google OAuth, let NextAuth handle the redirect
        await signIn('google', { 
          callbackUrl: '/', // Redirect to main page after successful login
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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

  const signup = useCallback(async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      return { success: true, message: data.message };
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
      const response = await fetch('/api/auth/google-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Google signup failed');
      }

      return { success: true, message: data.message };
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