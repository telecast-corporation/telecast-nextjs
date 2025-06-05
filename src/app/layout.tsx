import { Lexend } from "next/font/google";
import "./globals.css";
import { Box } from '@mui/material';
import { AuthSessionProvider } from './providers';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import ClientLayout from '@/components/ClientLayout';
import { AudioProvider } from '@/contexts/AudioContext';

const lexend = Lexend({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//accounts.google.com" />
        
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Optimized prefetch strategy - only prefetch most critical pages */}
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/login" />
        
        {/* Defer less critical pages */}
        <link rel="prefetch" href="/about" as="document" />
        <link rel="prefetch" href="/services" as="document" />
        <link rel="prefetch" href="/contact" as="document" />
        <link rel="prefetch" href="/signup" as="document" />
      </head>
      <body className={lexend.className}>
        <AuthSessionProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AudioProvider>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </Box>
            </AudioProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
