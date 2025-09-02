'use client';

import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import Image from 'next/image';

export default function PartnerLogos() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'row' },
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 8, sm: 10, md: 15 },
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        overflow: { xs: 'auto', sm: 'visible' },
        scrollSnapType: { xs: 'x mandatory', sm: 'none' },
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        minWidth: { xs: '100%', sm: 'auto' },
        flexWrap: 'nowrap',
        // Soft border styling
        border: '1px solid #2563eb',
        borderRadius: 3,
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        boxShadow: '0 2px 12px rgba(37, 99, 235, 0.08)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
      }}
    >
      {/* WebMall logo and link */}
      <Link
        href="https://webmall.ca"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          scrollSnapAlign: { xs: 'start', sm: 'none' },
          flexShrink: 0,
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
            maxHeight: { xs: '60px', sm: '100px', md: '140px' },
            maxWidth: { xs: '120px', sm: '200px', md: '400px' },
            width: { xs: '100%', sm: '150%' },
            height: 'auto',
            borderRadius: 2,
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <Image
            src="/webmall.jpeg"
            alt="WebMall.ca - Click to visit our partner shopping mall"
            width={400}
            height={700}
            style={{
              height: 'auto',
              width: '150%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </Box>
      </Link>

      {/* Shopping phrase text - now clickable */}
      <Link
        href="https://webmall.ca"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          gap: 0.5,
          flexShrink: 0,
          scrollSnapAlign: { xs: 'start', sm: 'none' },
          minWidth: { xs: '200px', sm: 'auto' },
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.02)',
            '& .shopping-text': {
              color: '#1d4ed8',
            },
          },
        }}
      >
        <Typography
          className="shopping-text"
          variant="h6"
          sx={{
            color: '#2563eb',
            fontWeight: 600,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
          }}
        >
          Feel like shopping? Click and Go.
        </Typography>
        <Typography
          className="shopping-text"
          variant="h6"
          sx={{
            color: '#2563eb',
            fontWeight: 600,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
          }}
        >
          Visit our partner shopping mall today.
        </Typography>
      </Link>
    </Box>
  );
} 