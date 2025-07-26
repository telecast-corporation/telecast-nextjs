'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import { typography, spacing, borderRadius } from '@/styles/typography';
import MicIcon from '@mui/icons-material/Mic';
import PeopleIcon from '@mui/icons-material/People';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function MissionPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mx: 'auto',
        p: spacing.component,
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 4,
        fontFamily: 'Open Sans, sans-serif',
      }}
    >
      <Typography
        variant="h2"
        align="center"
        sx={{
          color: theme.palette.primary.main,
          ...typography.title,
          mb: spacing.section,
          fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
          fontWeight: 700,
        }}
      >
        Our Mission
      </Typography>

      {/* Main Mission Statement */}
      <Box sx={{ mb: spacing.section }}>
        <Card 
          sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            borderRadius: borderRadius.large,
            boxShadow: 3,
            mb: spacing.gap,
          }}
        >
          <CardContent sx={{ p: spacing.gap, textAlign: 'center' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                ...typography.subheading, 
                mb: spacing.gap, 
                fontSize: '1.8rem', 
                fontWeight: 600 
              }}
            >
              Empowering Content Creators and Enriching Lives Through Audio
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                ...typography.body, 
                fontSize: '1.3rem', 
                lineHeight: 1.7,
                maxWidth: 800,
                mx: 'auto'
              }}
            >
              At Telecast, we believe in the transformative power of audio content. Our mission is to create a platform where content creators can freely express themselves and reach their audience, while listeners can discover and engage with meaningful content that enriches their lives.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Core Values Grid */}
      <Box sx={{ mb: spacing.section }}>
        <Typography 
          variant="h3" 
          align="center"
          sx={{ 
            ...typography.heading,
            color: theme.palette.text.primary,
            mb: spacing.section,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.7rem' },
            fontWeight: 700,
          }}
        >
          Our Core Values
        </Typography>
        
        <Grid container spacing={spacing.gap}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: borderRadius.large,
                boxShadow: 2,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent sx={{ p: spacing.gap, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <MicIcon sx={{ fontSize: '3rem', color: theme.palette.primary.main }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    ...typography.subheading,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Creator Freedom
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ...typography.body,
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  We empower creators with the tools and platform they need to share their voice with the world, free from unnecessary restrictions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: borderRadius.large,
                boxShadow: 2,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent sx={{ p: spacing.gap, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: '3rem', color: theme.palette.primary.main }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    ...typography.subheading,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Community First
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ...typography.body,
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  We foster a vibrant community where listeners and creators can connect, share ideas, and grow together.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: borderRadius.large,
                boxShadow: 2,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent sx={{ p: spacing.gap, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <LightbulbIcon sx={{ fontSize: '3rem', color: theme.palette.primary.main }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    ...typography.subheading,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Innovation
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ...typography.body,
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  We continuously innovate to provide the best possible experience for both creators and listeners.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* What We Believe Section */}
      <Box sx={{ mb: spacing.section }}>
        <Grid container spacing={spacing.section} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: borderRadius.large,
                overflow: 'hidden',
                boxShadow: 3,
              }}
            >
              <Image 
                src="https://img.freepik.com/free-vector/podcast-concept-illustration_114360-7885.jpg?w=826&t=st=1716210000~exp=1716210600~hmac=9c4dc9b5f997e71669a40e6ec9c3068d19d3c1aa24e39f73ed0e57c8bc207f25" 
                alt="Podcast Mission" 
                width={826}
                height={620}
                style={{ width: '100%', height: 'auto' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h3" 
              sx={{ 
                ...typography.heading,
                color: theme.palette.text.primary,
                mb: spacing.gap,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.7rem' },
                fontWeight: 700,
              }}
            >
              What We Believe
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                ...typography.body,
                color: theme.palette.text.secondary,
                fontSize: '1.2rem',
                lineHeight: 1.7,
                mb: 3
              }}
            >
              Every voice matters. Every story deserves to be heard. We believe that audio content has the unique power to connect people across cultures, languages, and experiences.
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                ...typography.body,
                color: theme.palette.text.secondary,
                fontSize: '1.2rem',
                lineHeight: 1.7
              }}
            >
              Our platform is built on the foundation that creativity should be accessible to everyone, and that meaningful conversations can change the world.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Impact Stats */}
      <Box 
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          mb: 6
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main,
            mb: 3,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Our Impact
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '3rem', mb: 1 }}>🎙️</Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontSize: '2.5rem'
                }}
              >
                10,000+
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                Active Creators
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '3rem', mb: 1 }}>🌍</Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontSize: '2.5rem'
                }}
              >
                150+
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                Countries Reached
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '3rem', mb: 1 }}>💝</Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontSize: '2.5rem'
                }}
              >
                99%
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                Creator Satisfaction
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Join Our Mission
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1.3rem',
            lineHeight: 1.6,
            mb: 3
          }}
        >
          Whether you're a creator looking to share your voice or a listener seeking meaningful content, we invite you to be part of our growing community.
        </Typography>
        <Link 
          href="/auth/login?screen_hint=signup" 
          style={{ 
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: 'white',
            color: theme.palette.primary.main,
            fontWeight: 600,
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: '1.1rem',
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          Get Started Today
        </Link>
      </Box>
    </Box>
  );
} 