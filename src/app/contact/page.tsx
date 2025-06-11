'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

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
      component="main"
      sx={{
        maxWidth: 700,
        mx: 'auto',
        my: { xs: 4, md: 8 },
        p: { xs: 2, sm: 4 },
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
          fontWeight: 700,
          mb: 3,
          fontSize: { xs: '2rem', sm: '2.5rem' },
          fontFamily: 'inherit',
        }}
      >
        Contact Us
      </Typography>
      <Box
        component="form"
        action="https://formsubmit.co/admin@telecast.ca"
        method="POST"
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_next" value="/thank-you" />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="name" sx={{ mb: 1, fontWeight: 600, color: 'text.primary', fontSize: '1.2rem' }}>
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
              padding: '1rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 10,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.2rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="email" sx={{ mb: 1, fontWeight: 600, color: 'text.primary', fontSize: '1.2rem' }}>
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
              padding: '1rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 10,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.2rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="message" sx={{ mb: 1, fontWeight: 600, color: 'text.primary', fontSize: '1.2rem' }}>
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
              padding: '1rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 10,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.2rem',
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
            fontSize: '1.25rem',
            padding: '14px 0',
            borderRadius: '8px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            mt: 2,
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