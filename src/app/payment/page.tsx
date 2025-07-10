'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Alert,
  Container,
  Paper,
  Button,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
  Grid,
  Link,
  Fade,
} from '@mui/material';
import PaymentForm from '@/components/PaymentForm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BroadcastOnPersonalIcon from '@mui/icons-material/BroadcastOnPersonal';

export default function PaymentPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentStatus('success');
    setPaymentMessage('Payment successful! Thank you for your purchase.');
    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    setPaymentMessage(error);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'transparent',
        background: 'linear-gradient(135deg, #1976d2 0%, #2193b0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        py: { xs: 1, sm: 3 },
      }}
    >
      {/* Colorful header */}
      <Box sx={{ width: '100%', py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
        <Avatar sx={{ bgcolor: 'white', width: 64, height: 64, mb: 1, boxShadow: 2 }}>
          <CreditCardIcon sx={{ color: '#2193b0', fontSize: 36 }} />
        </Avatar>
        <Typography variant="h4" component="h1" color="white" fontWeight={700} gutterBottom align="center" sx={{ letterSpacing: 0.2, mb: 0.5, textShadow: '0 2px 8px rgba(33,147,176,0.15)' }}>
          Telecast Premium
        </Typography>
        <Typography variant="h6" color="white" align="center" sx={{ opacity: 0.95, fontWeight: 400, maxWidth: 520, mb: 0.5, fontSize: { xs: 16, sm: 18 }, textShadow: '0 2px 8px rgba(33,147,176,0.10)' }}>
          Unlock all features and unlimited podcast uploads
        </Typography>
        <Typography variant="subtitle2" color="white" align="center" sx={{ fontWeight: 400, maxWidth: 520, fontSize: { xs: 14, sm: 15 }, opacity: 0.9 }}>
          Just <b>5 CAD/month</b>
        </Typography>
      </Box>

      {/* Vibrant card layout */}
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: 5,
            p: { xs: 2, sm: 3 },
            boxShadow: '0 8px 32px 0 rgba(33, 147, 176, 0.15)',
            background: 'rgba(255,255,255,0.97)',
            minHeight: 340,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 600,
            mx: 'auto',
            borderTop: '6px solid #2193b0',
          }}
        >
          <Stack spacing={3} alignItems="center" sx={{ width: '100%' }}>
            {/* Features list */}
            <Stack spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
              <Typography variant="h6" fontWeight={600} color="#2193b0" gutterBottom sx={{ letterSpacing: 0.1, fontSize: { xs: 18, sm: 20 } }}>
                What you get
              </Typography>
              <Stack spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CloudUploadIcon sx={{ color: '#2193b0', fontSize: 22 }} />
                  <Typography fontWeight={500} fontSize={15} color="#222">
                    Unlimited podcast uploads
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <BroadcastOnPersonalIcon sx={{ color: '#6dd5ed', fontSize: 22 }} />
                  <Typography fontWeight={500} fontSize={15} color="#222">
                    Broadcast to all podcast platforms
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EditNoteIcon sx={{ color: '#43cea2', fontSize: 22 }} />
                  <Typography fontWeight={500} fontSize={15} color="#222">
                    Unlimited editing tools
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {/* Payment form */}
            <Box sx={{ width: '100%', mt: 1 }}>
              <PaymentForm
                amount={5}
                currency="cad"
                description="Telecast Premium Monthly Subscription (5 CAD)"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              <Fade in={paymentStatus !== 'idle'}>
                <Box>
                  {paymentStatus === 'success' && (
                    <Alert
                      icon={<CheckCircleIcon fontSize="inherit" color="success" />} 
                      severity="success"
                      sx={{ mt: 2, mb: 2, fontSize: 16, alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRadius: 2 }}
                    >
                      {paymentMessage}
                    </Alert>
                  )}
                  {paymentStatus === 'error' && (
                    <Alert severity="error" sx={{ mt: 2, mb: 2, fontSize: 16, alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRadius: 2 }}>
                      {paymentMessage}
                    </Alert>
                  )}
                </Box>
              </Fade>
            </Box>
          </Stack>
          <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
            <Link
              component="button"
              underline="hover"
              color="#2193b0"
              sx={{ fontWeight: 400, fontSize: 15, opacity: 0.8 }}
              onClick={() => router.push('/')}
            >
              Back to Home
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 