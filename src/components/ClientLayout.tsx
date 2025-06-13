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
          pt: { xs: 8, sm: 10 }, // Reduced top padding
          pb: { xs: 8, sm: 9 },   // Keep bottom padding for floating player
          minHeight: '100vh',     // Ensure minimum full viewport height
          mt: 0, // Remove extra margin top
          px: { xs: 2, sm: 3 },   // Added horizontal padding
        }}
      >
        {children}
      </Box>
      <Footer />
      <FloatingPlayer />
    </>
  );
} 