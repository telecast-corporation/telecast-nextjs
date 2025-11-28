'use client';

import { Box, useTheme, useMediaQuery } from '@mui/material';
import MainNav from './MainNav';
import Footer from './Footer';
import FloatingPlayer from './FloatingPlayer';
import { navbarSizing } from '@/styles/typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery(theme.breakpoints.only('xs'));
  const isTablet = useMediaQuery(theme.breakpoints.only('sm'));

  return (
    <ThemeProvider theme={theme}>
      <MainNav />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          pt: { 
            xs: '12rem', 
            sm: '12rem', 
            md: '10rem', 
            lg: '10rem'  
          },
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
    </ThemeProvider>
  );
}
