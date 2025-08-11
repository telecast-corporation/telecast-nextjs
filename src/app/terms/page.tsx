'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  useTheme,
} from '@mui/material';

export default function TermsPage() {
  const theme = useTheme();

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
          Terms of Service
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
          Please read these terms carefully before using our podcast hosting and distribution platform.
        </Typography>
      </Box>

      {/* Terms Content */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          p: 4
        }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          1. Acceptance of Terms
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            mb: 3
          }}
        >
          By accessing and using Telecast's podcast hosting and distribution services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </Typography>

        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          2. Use License
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            mb: 3
          }}
        >
          Permission is granted to temporarily use our platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials, use the materials for any commercial purpose, or attempt to reverse engineer any software contained on our platform.
        </Typography>

        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          3. Content Guidelines
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            mb: 3
          }}
        >
          Users are responsible for all content they upload, record, or distribute through our platform. Content must not violate any applicable laws, infringe on intellectual property rights, or contain harmful, offensive, or inappropriate material. We reserve the right to remove content that violates these guidelines.
        </Typography>

        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          4. Service Availability
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            mb: 3
          }}
        >
          We strive to provide reliable hosting and distribution services, but we do not guarantee uninterrupted access. Our platform may be temporarily unavailable due to maintenance, updates, or technical issues. We will provide reasonable notice for scheduled maintenance.
        </Typography>

        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          5. Privacy and Data
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            mb: 3
          }}
        >
          Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your information.
        </Typography>

        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          6. Limitation of Liability
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            mb: 3
          }}
        >
          In no event shall Telecast or its suppliers be liable for any damages arising out of the use or inability to use our services, even if we have been notified orally or in writing of the possibility of such damage.
        </Typography>

        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          7. Changes to Terms
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            mb: 3
          }}
        >
          We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service after changes constitutes acceptance of the new terms.
        </Typography>

        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.8rem',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          8. Contact Information
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem'
          }}
        >
          If you have any questions about these Terms of Service, please contact us through our support channels.
        </Typography>
      </Paper>

      {/* Last Updated */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}
        >
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Container>
  );
}
