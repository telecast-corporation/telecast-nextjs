'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import '../styles/App.css';

interface NavLink {
  href: string;
  label: string;
  onClick?: () => void;
}

const navLinksBase: NavLink[] = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/search', label: 'Explore' },
];

const HeaderNav: React.FC = () => {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');

  // Debug auth state
  useEffect(() => {
    const info = `
      Auth Status:
      - Loading: ${isLoading}
      - Authenticated: ${isAuthenticated}
      - User: ${user?.email || 'Not logged in'}
      - User ID: ${user?.id || 'N/A'}
      - User Name: ${user?.name || 'N/A'}
      - Current Path: ${pathname}
    `;
    console.log('Auth State Changed:', info);
    setDebugInfo(info);
  }, [user, isLoading, isAuthenticated, pathname]);

  const handleSignIn = async () => {
    try {
      await login();
      setDebugInfo(prev => prev + '\nSign in initiated');
    } catch (error) {
      console.error('Sign in error:', error);
      setDebugInfo(prev => prev + '\nSign in error: ' + error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setDebugInfo(prev => prev + '\nSign out initiated');
    } catch (error) {
      console.error('Sign out error:', error);
      setDebugInfo(prev => prev + '\nSign out error: ' + error);
    }
  };

  // Define authenticated and unauthenticated links
  const authenticatedLinks: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/upload', label: 'Upload' },
    { href: '/profile', label: 'Profile' },
    { 
      href: '#', 
      label: 'Sign Out',
      onClick: handleSignOut 
    }
  ];

  const unauthenticatedLinks: NavLink[] = [
    { 
      href: '#', 
      label: 'Sign In',
      onClick: handleSignIn 
    }
  ];

  // Combine links based on authentication state
  const navLinks = [
    ...navLinksBase,
    ...(isAuthenticated ? authenticatedLinks : unauthenticatedLinks)
  ];

  if (isLoading) {
    return (
      <header style={{ 
        padding: '1rem 2rem', 
        backgroundColor: '#fff', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>Loading...</div>
      </header>
    );
  }

  return (
    <>
      <header style={{ 
        padding: '1rem 2rem', 
        backgroundColor: '#fff', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/telecast-logo.gif"
              alt="Telecast Logo"
              width={0}
              height={0}
              style={{ width: 'auto', height: 'auto', transform: 'scale(0.5)' }}
              priority
            />
          </div>
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.onClick}
              style={{ 
                color: pathname === link.href ? '#0077ff' : '#333',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s',
                cursor: 'pointer'
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Debug info */}
        <div style={{ 
          fontSize: '12px', 
          color: '#666',
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
          maxWidth: '100%',
          overflow: 'auto',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          {debugInfo}
        </div>
      </header>
    </>
  );
};

export default HeaderNav; 