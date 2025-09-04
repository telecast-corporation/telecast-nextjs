'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Lexend } from 'next/font/google';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function Footer() {
  const theme = useTheme();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Telecast
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Your dynamic source for podcasts, videos, live streams, books,  music, and exclusive shows. Uncover compelling stories, binge captivating content, and share your passions effortlessly.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              color="text.primary" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontFamily: lexend.style.fontFamily,
                fontWeight: 700
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, 
              gap: { xs: 1, sm: 2 },
              maxWidth: '100%'
            }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                Home
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/about')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                About
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/services')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                Services
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/contact')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                Contact
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/mission')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                Mission
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/faq')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                FAQ
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/terms')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                Terms
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/privacy')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                Privacy
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/pricing')}
                sx={{ 
                  textAlign: 'left', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  justifyContent: 'flex-start'
                }}
              >
                Pricing
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              color="text.primary" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontFamily: lexend.style.fontFamily,
                fontWeight: 700
              }}
            >
              Contact Us
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  mb: 1
                }}
              >
                Email us by sending a quick note to:
              </Typography>
              <Link
                href="mailto:admin@telecast.ca"
                sx={{ 
                  color: 'primary.main',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                admin@telecast.ca
              </Link>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 400,
                  mb: 1
                }}
              >
                Or call us at:
              </Typography>
              <Link
                href="tel:1-800-905-6572"
                sx={{ 
                  color: 'primary.main',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: lexend.style.fontFamily,
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                1-800-905-6572
              </Link>
            </Box>
            <Typography 
              variant="h6" 
              color="text.primary" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontFamily: lexend.style.fontFamily,
                fontWeight: 700,
                mt: 3
              }}
            >
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <IconButton
                aria-label="Facebook"
                sx={{ color: 'text.secondary' }}
                onClick={() => window.open('https://facebook.com', '_blank')}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                sx={{ color: 'text.secondary' }}
                onClick={() => window.open('https://twitter.com', '_blank')}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                aria-label="Instagram"
                sx={{ color: 'text.secondary' }}
                onClick={() => window.open('https://instagram.com', '_blank')}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                aria-label="LinkedIn"
                sx={{ color: 'text.secondary' }}
                onClick={() => window.open('https://linkedin.com', '_blank')}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' } }}>
            © {new Date().getFullYear()} Telecast. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 