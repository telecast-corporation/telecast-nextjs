'use client';

import { Box } from '@mui/material';
import MainNav from './MainNav';
import Footer from './Footer';
import FloatingPlayer from './FloatingPlayer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNav />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          pt: { xs: 12, sm: 14 }, // Increased top padding for more margin
          pb: { xs: 8, sm: 9 },   // Keep bottom padding for floating player
          minHeight: '100vh',     // Ensure minimum full viewport height
        }}
      >
        {children}
      </Box>
      <Footer />
      <FloatingPlayer />
    </>
  );
} 