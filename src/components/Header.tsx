
'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import { FiMenu, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { headerHeight } from '@/styles/theme'; // Import headerHeight
import { usePathname } from 'next/navigation';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, login } = useAuth();
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Services', path: '/services' },
    { title: 'Local News', path: '/local-news' },
    { title: 'FAQ', path: '/faq' },
    { title: 'Contact', path: '/contact' },
    { title: 'Pricing', path: '/pricing' },
  ];

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ width: 250, height: '100%', background: 'linear-gradient(180deg, #1e1e2f, #1e1e1e)', color: 'white' }}
    >
      <IconButton onClick={handleDrawerToggle} sx={{ color: 'white', m: 1 }}>
        <FiX />
      </IconButton>
      <List>
        {navLinks.map(({ title, path }) => (
          <ListItem button component={Link} href={path} key={title}>
            <ListItemText primary={title} />
          </ListItem>
        ))}
        {user ? (
          <>
            <ListItem button component={Link} href="/profile">
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={logout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => login()}>
            <ListItemText primary="Sign In" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
          borderBottom: scrolled ? `1px solid ${theme.palette.divider}` : 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              height: isMobile ? headerHeight.mobile : headerHeight.desktop,
            }}
          >
            <Box sx={{ flexGrow: { xs: 1, md: 0 } }}>
              <Link href="/">
                <Box
                  component="img"
                  src="https://i.ibb.co/ycff7ttv/telecast-logo-removebg-preview.png"
                  alt="Telecast"
                  sx={{
                    height: isMobile ? '35px' : '45px',
                    width: 'auto',
                    display: 'block',
                    transition: 'height 0.3s ease',
                  }}
                />
              </Link>
            </Box>

            {isMobile ? (
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <FiMenu />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, overflowX: 'auto' }}>
                {navLinks.map(({ title, path }) => (
                  <Button
                    key={title}
                    component={Link}
                    href={path}
                    sx={{
                      color: pathname === path ? theme.palette.primary.main : 'black',
                      mx: 2,
                      fontWeight: 500,
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {title}
                  </Button>
                ))}
              </Box>
            )}

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {user ? (
                  <Link href="/profile" passHref>
                    <IconButton>
                      <Avatar alt={user.name} src={user.image} />
                    </IconButton>
                  </Link>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => login()}
                    sx={{ borderRadius: '50px', px: 4, fontWeight: 600 }}
                  >
                    Sign In
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
      <Toolbar sx={{ height: isMobile ? headerHeight.mobile : headerHeight.desktop }} />
    </>
  );
};

export default Header;
