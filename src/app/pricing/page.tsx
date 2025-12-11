'use client';

import React from 'react';
import Link from 'next/link';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import { typography, spacing, borderRadius } from '@/styles/typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const pricingTiers = [
  {
    title: 'Basic',
    price: 'Free',
    description: 'For individuals and hobbyists starting out.',
    features: [
      'Up to 1,000 listeners',
      'Basic analytics',
      'Community support',
    ],
  },
  {
    title: 'Pro',
    price: '$25/mo',
    description: 'For professionals and growing businesses.',
    features: [
      'Up to 10,000 listeners',
      'Advanced analytics',
      'Priority support',
      'Monetization options',
    ],
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    description: 'For large-scale organizations and networks.',
    features: [
      'Unlimited listeners',
      'Dedicated infrastructure',
      '24/7 priority support',
      'Custom integrations',
    ],
  },
];

export default function Pricing() {
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
        Our Pricing Plans
      </Typography>

      <Grid container spacing={spacing.gap}>
        {pricingTiers.map((tier) => (
          <Grid item xs={12} md={4} key={tier.title}>
            <Card 
              sx={{ 
                borderRadius: borderRadius.large,
                boxShadow: 3,
                p: spacing.gap,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ ...typography.subheading, fontWeight: 600, color: theme.palette.primary.main, mb: 1 }}>
                  {tier.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '2rem', mb: 1 }}>
                  {tier.price}
                </Typography>
                <Typography variant="body1" sx={{ ...typography.body, color: theme.palette.text.secondary, mb: 3 }}>
                  {tier.description}
                </Typography>
                <Box>
                  {tier.features.map((feature) => (
                    <Box key={feature} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Link href="/auth/login?screen_hint=signup" passHref>
                  <Button variant="contained" color="primary" fullWidth sx={{ fontWeight: 600, py: 1.5, borderRadius: '50px' }}>
                    Get Started
                  </Button>
                </Link>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          color: 'white',
          mt: 6
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
          Get Started for Free
        </Link>
      </Box>
    </Box>
  );
}
