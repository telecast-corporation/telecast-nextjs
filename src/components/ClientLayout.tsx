'use client';

import { Box, useTheme, useMediaQuery } from '@mui/material';
import MainNav from './MainNav';
import Footer from './Footer';
import FloatingPlayer from './FloatingPlayer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.only('xs'));
  const isTablet = useMediaQuery(theme.breakpoints.only('sm'));

  return (
    <>
      <MainNav />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          pt: { xs: 40, sm: 40, md: 40, lg: 25 }, // More consistent padding for small screens, gradually decreasing
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