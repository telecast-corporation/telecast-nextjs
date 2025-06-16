'use client';

import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { typography, spacing, borderRadius } from '@/styles/typography';

export default function ThankYou() {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      maxWidth: 600, 
      mx: 'auto', 
      my: spacing.section, 
      p: spacing.component, 
      borderRadius: borderRadius.xlarge, 
      backgroundColor: theme.palette.background.paper, 
      boxShadow: 4, 
      textAlign: 'center' 
    }}>
      <Typography variant="h2" sx={{ 
        ...typography.title, 
        color: theme.palette.primary.main, 
        mb: spacing.gap 
      }}>
        Thank You!
      </Typography>
      <Typography variant="body1" sx={{ 
        ...typography.body, 
        color: theme.palette.text.primary, 
        mb: spacing.section 
      }}>
        Your message has been received. We appreciate your feedback and will get back to you as soon as possible.
      </Typography>
      <Link href="/" passHref legacyBehavior>
        <Button 
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            ...typography.button,
            padding: spacing.button,
            borderRadius: borderRadius.medium,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Back to Home
        </Button>
      </Link>
    </Box>
  );
} 