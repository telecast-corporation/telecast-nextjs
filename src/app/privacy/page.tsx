'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  useTheme,
} from '@mui/material';

export default function PrivacyPage() {
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
          Privacy Policy
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
          We are committed to protecting your privacy and ensuring the security of your personal information.
        </Typography>
      </Box>

      {/* Privacy Content */}
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
          1. Information We Collect
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
          We collect information you provide directly to us, such as when you create an account, upload content, or contact us for support. This may include your name, email address, podcast content, and other information you choose to provide.
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
          2. How We Use Your Information
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
          We use the information we collect to provide, maintain, and improve our services, process your podcast uploads, communicate with you about your account, and ensure the security of our platform.
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
          3. Information Sharing
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
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our platform.
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
          4. Data Security
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
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
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
          5. Cookies and Tracking
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
          We use cookies and similar technologies to enhance your experience on our platform, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
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
          6. Your Rights
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
          You have the right to access, update, or delete your personal information. You may also opt out of certain communications and request information about how we process your data.
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
          7. Children's Privacy
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
          Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us.
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
          8. Changes to This Policy
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
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
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
          9. Contact Us
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
            fontSize: '1rem'
          }}
        >
          If you have any questions about this Privacy Policy, please contact us through our support contact form.
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
