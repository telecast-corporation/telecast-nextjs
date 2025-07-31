'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { typography, spacing, borderRadius } from '@/styles/typography';

export default function Contacts() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: '90%', sm: '500px', md: '600px', lg: '700px' },
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 4,
        fontFamily: 'Open Sans, sans-serif',
        minHeight: 'fit-content',
        maxHeight: '90vh',
        overflow: 'auto',
      }}
    >
      <Typography
        variant="h2"
        align="center"
        sx={{
          color: theme.palette.primary.main,
          ...typography.title,
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
          fontWeight: 700,
        }}
      >
        Contact Us
      </Typography>
      <style jsx global>{`
        input::placeholder,
        textarea::placeholder {
          font-size: 0.9rem !important;
        }
      `}</style>
      <Box
        component="form"
        action="https://formsubmit.co/admin@telecast.ca"
        method="POST"
        sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}
      >
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_next" value="/thank-you" />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="name" sx={{ mb: 1, ...typography.subheading, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600 }}>
            Your Name *
          </Typography>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            style={{
              padding: '0.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="email" sx={{ mb: 1, ...typography.subheading, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600 }}>
            Email *
          </Typography>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            style={{
              padding: '0.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="message" sx={{ mb: 1, ...typography.subheading, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600 }}>
            Message *
          </Typography>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message here..."
            style={{
              padding: '0.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>
        <Button
          type="submit"
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            ...typography.button,
            padding: spacing.button,
            borderRadius: borderRadius.medium,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            mt: { xs: 1, sm: 1.5 },
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Send Message
        </Button>
      </Box>
    </Box>
  );
} 