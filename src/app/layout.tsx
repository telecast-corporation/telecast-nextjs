
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from './providers';
import { AudioProvider } from '@/contexts/AudioContext';
import ThemeRegistry from '@/components/ThemeRegistry';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MainNav from '@/components/MainNav';
import { Box } from '@mui/material';

const poppins = Poppins({ 
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
      <body className={poppins.className}>
        <AuthSessionProvider>
          <AudioProvider>
            <ThemeRegistry>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <MainNav />
                <Box component="main" sx={{ flexGrow: 1 }}>
                  {children}
                </Box>
                <Footer />
              </Box>
            </ThemeRegistry>
          </AudioProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
