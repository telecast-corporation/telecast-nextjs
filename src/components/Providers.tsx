'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import { AudioProvider } from '@/contexts/AudioContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AudioProvider>
        {children}
      </AudioProvider>
    </ThemeProvider>
  );
} 