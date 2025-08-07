'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  useTheme,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import StartFreeTrial from '@/components/StartFreeTrial';

export default function PricingPage() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
            color: theme.palette.primary.main
          }}
        >
          Simple, Transparent Pricing
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            fontSize: '1.2rem',
            lineHeight: 1.7
          }}
        >
          Start your podcasting journey with our generous free trial and unlock unlimited possibilities.
        </Typography>
      </Box>

      {/* Free Trial Banner */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          p: 4,
          mb: 6,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            mb: 2
          }}
        >
          🎉 90-Day Free Trial
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1.1rem',
            lineHeight: 1.6,
            mb: 3
          }}
        >
          Try all premium features completely free for 90 days. No credit card required.
        </Typography>
        <Chip 
          label="Limited Time Offer" 
          color="secondary" 
          sx={{ 
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        />
      </Paper>

      {/* Pricing Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Free Plan */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 3,
              p: 4,
              height: '100%',
              border: `2px solid ${theme.palette.divider}`,
              position: 'relative'
            }}
          >
            <Typography 
              variant="h4" 
              component="h3" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                fontSize: '1.8rem',
                color: theme.palette.primary.main,
                mb: 2
              }}
            >
              Free Plan
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: '2.5rem',
                color: theme.palette.text.primary,
                mb: 1
              }}
            >
              $0
              <Typography 
                component="span" 
                variant="body1" 
                sx={{ 
                  fontSize: '1rem',
                  color: theme.palette.text.secondary,
                  ml: 1
                }}
              >
                /month
              </Typography>
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: '1rem',
                lineHeight: 1.6,
                mb: 4
              }}
            >
              Perfect for getting started with podcasting
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  <strong>2 podcasts</strong> hosted on Telecast
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  Broadcast to Spotify, Apple Podcasts, Google Podcasts
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  Basic recording and editing tools
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  Standard customer support
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined" 
              fullWidth
              onClick={() => router.push('/profile')}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  borderColor: theme.palette.primary.dark,
                  color: theme.palette.primary.dark,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.25)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
              }}
            >
              🚀 Sign Up for Free and Get Started
            </Button>
          </Paper>
        </Grid>

        {/* Premium Plan */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ 
              borderRadius: 3,
              p: 4,
              height: '100%',
              border: `3px solid ${theme.palette.primary.main}`,
              position: 'relative',
              background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
            }}
          >
            {/* Popular Badge */}
            <Box sx={{ 
              position: 'absolute', 
              top: -12, 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 1
            }}>
              <Chip 
                icon={<StarIcon />}
                label="Most Popular" 
                color="primary" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2
                }}
              />
            </Box>

            <Typography 
              variant="h4" 
              component="h3" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                fontSize: '1.8rem',
                color: theme.palette.primary.main,
                mb: 2,
                mt: 2
              }}
            >
              Premium Plan
            </Typography>
            
            {/* Original Price */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  textDecoration: 'line-through',
                  color: theme.palette.text.secondary,
                  fontSize: '1.2rem',
                  mr: 2
                }}
              >
                $17.99
              </Typography>
              <Chip 
                label="Save $2" 
                color="success" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: '2.5rem',
                color: theme.palette.primary.main,
                mb: 1
              }}
            >
              $15.99
              <Typography 
                component="span" 
                variant="body1" 
                sx={{ 
                  fontSize: '1rem',
                  color: theme.palette.text.secondary,
                  ml: 1
                }}
              >
                /month
              </Typography>
            </Typography>

            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: '1rem',
                lineHeight: 1.6,
                mb: 4
              }}
            >
              <strong>Special discount</strong> for first-time subscribers within 1 month of free trial ending
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  <strong>Unlimited podcasts</strong> hosted on Telecast
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  Broadcast to all major platforms worldwide
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  Advanced recording and editing tools
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  Priority customer support
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  Custom RSS feeds and advanced analytics
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  No ads or branding on your podcasts
                </Typography>
              </Box>
            </Box>

            <StartFreeTrial 
              variant="contained" 
              fullWidth
            >
              Start Free Trial
            </StartFreeTrial>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Info */}
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 3,
          p: 4,
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h5" 
          component="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.5rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          Why Choose Telecast?
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              component="h4" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.2rem',
                mb: 2
              }}
            >
              🎯 Easy to Use
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '1rem',
                lineHeight: 1.6,
                color: theme.palette.text.secondary
              }}
            >
              Intuitive tools designed for podcasters of all experience levels
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              component="h4" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.2rem',
                mb: 2
              }}
            >
              🌍 Global Reach
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '1rem',
                lineHeight: 1.6,
                color: theme.palette.text.secondary
              }}
            >
              Distribute your content to listeners worldwide on all major platforms
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              component="h4" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.2rem',
                mb: 2
              }}
            >
              💰 No Hidden Fees
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '1rem',
                lineHeight: 1.6,
                color: theme.palette.text.secondary
              }}
            >
              Transparent pricing with no surprise charges or setup fees
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
