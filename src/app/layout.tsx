import { Lexend } from "next/font/google";
import "./globals.css";
import { Box } from '@mui/material';
import { AuthSessionProvider } from './providers';
import ClientLayout from '@/components/ClientLayout';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';

const lexend = Lexend({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <AuthSessionProvider>
          <CustomThemeProvider>
            <CssBaseline />
            <AudioProvider>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </Box>
            </AudioProvider>
          </CustomThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
