'use client';

import React from 'react';
import { Box, Link } from '@mui/material';
import Image from 'next/image';

export default function PartnerLogos() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        py: 2,
        px: 2,
        flexWrap: 'wrap',
      }}
    >
      <Link
        href="https://webmall.ca"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <Image
          src="/webmall.jpeg"
          alt="WebMall.ca"
          width={120}
          height={40}
          style={{
            height: 'auto',
            maxHeight: '40px',
            objectFit: 'contain',
          }}
        />
      </Link>

      <Link
        href="https://sunnydeals.ca"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <Image
          src="/sunnydeals.jpeg"
          alt="SunnyDeals.ca"
          width={120}
          height={40}
          style={{
            height: 'auto',
            maxHeight: '40px',
            objectFit: 'contain',
          }}
        />
      </Link>

      <Link
        href="https://pharmadeals.com"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <Image
          src="/pharmadeals.jpeg"
          alt="Pharmadeals.com"
          width={120}
          height={40}
          style={{
            height: 'auto',
            maxHeight: '40px',
            objectFit: 'contain',
          }}
        />
      </Link>
    </Box>
  );
} 