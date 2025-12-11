
'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  IconButton,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  const theme = useTheme();

  const socialLinks = [
    { icon: <FiFacebook />, href: '#' },
    { icon: <FiTwitter />, href: '#' },
    { icon: <FiInstagram />, href: '#' },
    { icon: <FiLinkedin />, href: '#' },
  ];

  const navLinks = [
    { title: 'About Us', href: '/about' },
    { title: 'Our Mission', href: '/mission' },
    { title: 'Local News', href: '/local-news' },
    { title: 'Get Involved', href: '/local-news/upload' },
  ];

  const legalLinks = [
    { title: 'Privacy Policy', href: '#' },
    { title: 'Terms of Service', href: '#' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#121212',
        color: 'white',
        py: { xs: 4, sm: 6 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid item xs={12} md={5}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Telecast
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ color: '#a9a9a9'}}>
              Your trusted source for community-driven news. We empower citizen journalists to share their stories and keep you informed.
            </Typography>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Navigation
            </Typography>
            {navLinks.map((link) => (
              <Link href={link.href} passHref key={link.title}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, cursor: 'pointer', color: '#a9a9a9', '&:hover': { color: theme.palette.primary.main } }}
                >
                  {link.title}
                </Typography>
              </Link>
            ))}
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Legal
            </Typography>
            {legalLinks.map((link) => (
              <Link href={link.href} passHref key={link.title}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, cursor: 'pointer', color: '#a9a9a9', '&:hover': { color: theme.palette.primary.main } }}
                >
                  {link.title}
                </Typography>
              </Link>
            ))}
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Follow Us
            </Typography>
            <Box>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', mr: 1, '&:hover': { backgroundColor: theme.palette.primary.main } }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 5,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{color: '#a9a9a9'}}>
            &copy; {new Date().getFullYear()} Telecast. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
