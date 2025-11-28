import { Lexend } from "next/font/google";
import "./globals.css";
import { Box } from '@mui/material';
import { AuthSessionProvider } from './providers';
import ClientLayout from '@/components/ClientLayout';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';

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
        <link rel="prefetch" href="/my-podcasts" />
        <link rel="prefetch" href="/auth/login" />
        
        {/* Defer less critical pages */}
        <link rel="prefetch" href="/about" as="document" />
        <link rel="prefetch" href="/services" as="document" />
        <link rel="prefetch" href="/contact" as="document" />
        <link rel="prefetch" href="/auth/login" as="document" />
      </head>
      <body className={lexend.className}>
        <AuthSessionProvider>
            <AudioProvider>
              <ThemeProvider theme={theme}>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </ThemeProvider>
            </AudioProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
