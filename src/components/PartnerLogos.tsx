'use client';

import React from 'react';
import { Box, Link } from '@mui/material';
import Image from 'next/image';

export default function PartnerLogos() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: { xs: 'flex-start', sm: 'center' },
        alignItems: 'center',
        gap: { xs: 4, sm: 2, md: 1 },
        py: { xs: 0.5, sm: 1 },
        px: { xs: 1, sm: 2 },
        pb: { xs: 0.5, sm: 0.5 }, // Minimal bottom padding
        flexWrap: 'nowrap',
        overflow: { xs: 'auto', sm: 'visible' },
        scrollSnapType: { xs: 'x mandatory', sm: 'none' },
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        minWidth: { xs: '100%', sm: 'auto' },
        mb: { xs: 0.5, sm: 0 }, // Minimal margin bottom
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
          scrollSnapAlign: { xs: 'start', sm: 'none' },
          flexShrink: 0,
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <Box
          sx={{
            maxHeight: { xs: '50px', sm: '60px', md: '80px' },
            maxWidth: { xs: '120px', sm: '140px', md: '200px' },
            width: 'auto',
            height: 'auto',
          }}
        >
          <Image
            src="/webmall.jpeg"
            alt="WebMall.ca"
            width={200}
            height={80}
            style={{
              height: 'auto',
              width: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Link>

      <Link
                      href="https://sunnydeals.com"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          transition: 'transform 0.2s ease',
          scrollSnapAlign: { xs: 'start', sm: 'none' },
          flexShrink: 0,
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <Box
          sx={{
            maxHeight: { xs: '50px', sm: '60px', md: '80px' },
            maxWidth: { xs: '120px', sm: '140px', md: '200px' },
            width: 'auto',
            height: 'auto',
          }}
        >
          <Image
            src="/sunnydeals.jpeg"
                            alt="SunnyDeals.com"
            width={200}
            height={80}
            style={{
              height: 'auto',
              width: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
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
          scrollSnapAlign: { xs: 'start', sm: 'none' },
          flexShrink: 0,
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <Box
          sx={{
            maxHeight: { xs: '50px', sm: '60px', md: '80px' },
            maxWidth: { xs: '120px', sm: '140px', md: '200px' },
            width: 'auto',
            height: 'auto',
          }}
        >
          <Image
            src="/pharmadeals.jpeg"
            alt="Pharmadeals.com"
            width={200}
            height={80}
            style={{
              height: 'auto',
              width: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Link>
    </Box>
  );
} 