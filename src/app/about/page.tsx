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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: 'https://via.placeholder.com/300',
    bio: 'With over 15 years of experience in technology and leadership.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://via.placeholder.com/300',
    bio: 'Expert in cloud architecture and distributed systems.',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Head of Design',
    image: 'https://via.placeholder.com/300',
    bio: 'Leading UX/UI design with a focus on user-centered solutions.',
  },
];

const coreValues = [
  {
    title: 'Innovation',
    description: 'Constantly pushing boundaries to create cutting-edge solutions.',
    icon: <SpeedIcon fontSize="large" color="primary" />,
  },
  {
    title: 'Security',
    description: 'Ensuring the highest level of data protection and privacy.',
    icon: <SecurityIcon fontSize="large" color="primary" />,
  },
  {
    title: 'Collaboration',
    description: 'Working together to achieve exceptional results.',
    icon: <GroupsIcon fontSize="large" color="primary" />,
  },
];

export default function About() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mx: 'auto',
        p: spacing.component,
        mt: 4,
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
        About Telecast
      </Typography>

      {/* Features Section */}
      <Box sx={{ mb: spacing.section }}>
        <Grid container spacing={spacing.gap}>
          <Grid item xs={12}>
                          <Card 
                sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  borderRadius: borderRadius.large,
                  boxShadow: 3,
                  mb: spacing.gap,
                }}
              >
                <CardContent sx={{ p: spacing.gap }}>
                  <Typography variant="h5" sx={{ ...typography.subheading, mb: spacing.gap, display: 'flex', alignItems: 'center', fontSize: '1.6rem', fontWeight: 600 }}>
                    <span style={{ marginRight: '0.5rem' }}>👆</span>
                    User-Friendly Experience
                  </Typography>
                  <Typography variant="body1" sx={{ ...typography.body, fontSize: '1.1rem', lineHeight: 1.6 }}>
                    At the core of our service, we offer an exceptionally user-friendly platform designed for both novice and seasoned podcasters. Our recording tools are intuitive, allowing creators to focus on content rather than the complexities of technology.
                  </Typography>
                </CardContent>
              </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card 
              sx={{ 
                backgroundColor: theme.palette.primary.dark,
                color: 'white',
                borderRadius: borderRadius.large,
                boxShadow: 3,
                mb: spacing.gap,
              }}
            >
              <CardContent sx={{ p: spacing.gap }}>
                <Typography variant="h5" sx={{ ...typography.subheading, mb: spacing.gap, display: 'flex', alignItems: 'center', fontSize: '1.6rem', fontWeight: 600 }}>
                  <span style={{ marginRight: '0.5rem' }}>👥</span>
                  Community & Collaboration
                </Typography>
                <Typography variant="body1" sx={{ ...typography.body, fontSize: '1.1rem', lineHeight: 1.6 }}>
                  We believe in the power of community. Our platform isn't just a place to host podcasts; it's a thriving ecosystem where listeners can engage directly with creators and each other.
                  </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card 
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.8),
                color: 'white',
                borderRadius: borderRadius.large,
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ p: spacing.gap }}>
                <Typography variant="h5" sx={{ ...typography.subheading, mb: spacing.gap, display: 'flex', alignItems: 'center', fontSize: '1.6rem', fontWeight: 600 }}>
                  <span style={{ marginRight: '0.5rem' }}>🌍</span>
                  Content Diversity & Discovery
                </Typography>
                <Typography variant="body1" sx={{ ...typography.body, fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Our directory is curated to showcase the richness of human experience through audio. We commit to promoting a wide array of genres, from the niche to the mainstream.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Innovation Section */}
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
                alt="Innovation" 
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
              Innovation That Elevates Your Voice
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                ...typography.body,
                color: theme.palette.text.secondary,
                fontSize: '1.2rem',
                lineHeight: 1.7,
              }}
            >
              Our tools support emerging formats like 3D audio, choose-your-own-adventure episodes, and smart home integration—so you're not just podcasting, you're pioneering.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Why Creators Choose Telecast */}
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
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Why Creators Choose Telecast
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '1.3rem',
            lineHeight: 1.6,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          From easy tools to audience insights, Telecast is designed for storytellers who want simplicity, power, and growth in one place.
        </Typography>
      </Box>

      {/* Stats Section */}
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '3rem', mb: 1 }}>🎧</Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontSize: '2.5rem'
                }}
              >
                5,000+
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                Podcasts Hosted
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '3rem', mb: 1 }}>👥</Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontSize: '2.5rem'
                }}
              >
                1M+
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                Listeners Reached
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '3rem', mb: 1 }}>🚀</Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontSize: '2.5rem'
                }}
              >
                98%
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                Satisfaction Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Creator Spotlight */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.text.primary,
            mb: 3,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Creator Spotlight
        </Typography>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            mx: 'auto',
            mb: 3,
            overflow: 'hidden',
            boxShadow: 3,
          }}
        >
          <Image 
            src="https://randomuser.me/api/portraits/women/44.jpg" 
            alt="Jessie T." 
            width={100}
            height={100}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            fontStyle: 'italic', 
            color: theme.palette.text.secondary,
            fontSize: '1.4rem',
            lineHeight: 1.6,
            maxWidth: 600,
            mx: 'auto',
            mb: 2
          }}
        >
          "Telecast helped me go from zero to viral. Their tools were easy, and I felt heard every step of the way."
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 600, 
            color: theme.palette.text.primary,
            fontSize: '1.2rem'
          }}
        >
          Jessie T., Host of "Mind Over Mic"
        </Typography>
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
          Ready to Start Your Podcast Journey?
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1.3rem',
            lineHeight: 1.6,
            mb: 3
          }}
        >
          Join the Telecast community today and turn your voice into impact.
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
          Get Started
        </Link>
      </Box>
    </Box>
  );
}