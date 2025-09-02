'use client';

import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import Image from 'next/image';

export default function PartnerLogos() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        textAlign: 'center',
      }}
    >
      {/* Shopping phrase */}
      <Typography
        variant="h6"
        sx={{
          color: '#2563eb',
          fontWeight: 600,
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
          textAlign: 'center',
          mb: 1,
        }}
      >
        Feel like shopping? Click and Go! Visit our partner shopping mall today.
      </Typography>

      {/* WebMall logo and link */}
      <Link
        href="https://webmall.ca"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            '& .logo-image': {
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.2)',
            },
          },
        }}
      >
        <Box
          className="logo-image"
          sx={{
            maxHeight: { xs: '60px', sm: '80px', md: '100px' },
            maxWidth: { xs: '150px', sm: '200px', md: '250px' },
            width: 'auto',
            height: 'auto',
            borderRadius: 2,
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <Image
            src="/webmall.jpeg"
            alt="WebMall.ca - Click to visit our partner shopping mall"
            width={250}
            height={100}
            style={{
              height: 'auto',
              width: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </Box>
        
        {/* Clickable text below logo */}
        <Typography
          variant="body1"
          sx={{
            color: '#2563eb',
            fontWeight: 500,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            mt: 1,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            cursor: 'pointer',
            '&:hover': {
              color: '#1d4ed8',
            },
          }}
        >
          Click to visit WebMall.ca
        </Typography>
      </Link>
    </Box>
  );
} 