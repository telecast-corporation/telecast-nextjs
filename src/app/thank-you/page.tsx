import React from 'react';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function ThankYou() {
  return (
    <main style={{ maxWidth: 600, margin: '6rem auto', padding: '2.5rem', borderRadius: 16, backgroundColor: '#f4f6fa', boxShadow: '0 4px 16px rgba(30,64,175,0.08)', fontFamily: 'Open Sans, sans-serif', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2.5rem', color: '#2563eb', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'inherit' }}>
        Thank You!
      </h2>
      <p style={{ fontSize: '1.5rem', color: '#23272f', marginBottom: '2.5rem', fontFamily: 'inherit' }}>
        Your message has been received. We appreciate your feedback and will get back to you as soon as possible.
      </p>
      <Link href="/" passHref legacyBehavior>
        <Button 
          sx={{
            backgroundColor: '#2563eb',
            color: 'white',
            fontSize: '1.25rem',
            padding: '12px 32px',
            borderRadius: '8px',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            '&:hover': {
              backgroundColor: '#1e40af',
            },
          }}
        >
          Back to Home
        </Button>
      </Link>
    </main>
  );
} 