'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  useMediaQuery, 
  useTheme,
  Typography,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      setMobileOpen(false);
    } catch (error) {
      console.error('Sign in error:', error);
      setDebugInfo(prev => prev + '\nSign in error: ' + error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setDebugInfo(prev => prev + '\nSign out initiated');
      setMobileOpen(false);
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2 
      }}>
        <Typography variant="h6">Menu</Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItem 
            button 
            key={link.href} 
            component={Link} 
            href={link.href}
            onClick={() => {
              if (link.onClick) {
                link.onClick();
              }
              setMobileOpen(false);
            }}
            sx={{
              color: pathname === link.href ? 'primary.main' : 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (isLoading) {
    return (
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography>Loading...</Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ 
        display: 'flex',
          justifyContent: 'space-between',
        alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          py: 1
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              maxWidth: { xs: '150px', sm: '200px' }
            }}>
            <Image
              src="/telecast-logo.gif"
              alt="Telecast Logo"
              width={0}
              height={0}
                style={{ width: '100%', height: 'auto' }}
              priority
            />
            </Box>
        </Link>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              alignItems: 'center'
            }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.onClick}
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    color={pathname === link.href ? 'primary' : 'inherit'}
                    sx={{ 
                fontWeight: 500,
                      textTransform: 'none'
              }}
            >
              {link.label}
                  </Button>
            </Link>
          ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawer}
      </Drawer>

        {/* Debug info */}
      <Box sx={{ 
          fontSize: '12px', 
        color: 'text.secondary',
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
          maxWidth: '100%',
          overflow: 'auto',
        p: 2,
        bgcolor: 'background.default',
        borderRadius: 1,
        mt: 2,
        mx: 2
        }}>
          {debugInfo}
      </Box>
    </>
  );
};

export default HeaderNav; 