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
        maxWidth: { xs: '100%', sm: 'md', md: 'lg', lg: 'xl' },
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
        }}
      >
        Contact Us
      </Typography>
      <Box
        component="form"
        action="https://formsubmit.co/admin@telecast.ca"
        method="POST"
        sx={{ display: 'flex', flexDirection: 'column', gap: spacing.gap }}
      >
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_next" value="/thank-you" />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="name" sx={{ mb: 1, ...typography.label, color: 'text.primary' }}>
            Your Name
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
              padding: '1.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.8rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="email" sx={{ mb: 1, ...typography.label, color: 'text.primary' }}>
            Email
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
              padding: '1.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.8rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="message" sx={{ mb: 1, ...typography.label, color: 'text.primary' }}>
            Message
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
              padding: '1.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.8rem',
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
            mt: spacing.gap,
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