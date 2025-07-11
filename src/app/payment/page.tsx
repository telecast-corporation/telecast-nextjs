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
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import PaymentForm from '@/components/PaymentForm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BroadcastOnPersonalIcon from '@mui/icons-material/BroadcastOnPersonal';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportIcon from '@mui/icons-material/Support';
import StarIcon from '@mui/icons-material/Star';
import InfoIcon from '@mui/icons-material/Info';

export default function PaymentPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [errorType, setErrorType] = useState<'declined' | 'network' | 'general'>('general');
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
    
    // Determine error type for better styling
    if (error.toLowerCase().includes('declined') || error.toLowerCase().includes('card')) {
      setErrorType('declined');
    } else if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
      setErrorType('network');
    } else {
      setErrorType('general');
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'declined':
        return <CreditCardIcon fontSize="inherit" />;
      case 'network':
        return <ErrorOutlineIcon fontSize="inherit" />;
      default:
        return <ErrorOutlineIcon fontSize="inherit" />;
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case 'declined':
        return '#d32f2f';
      case 'network':
        return '#ed6c02';
      default:
        return '#d32f2f';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'transparent',
        background: '#1976d2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        py: { xs: 1, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Colorful header */}
      <Box sx={{ width: '100%', py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1, position: 'relative', zIndex: 1 }}>
        <Avatar sx={{ bgcolor: 'white', width: 48, height: 48, mb: 1, boxShadow: 3 }}>
          <CreditCardIcon sx={{ color: '#2193b0', fontSize: 28 }} />
        </Avatar>
        <Typography variant="h5" component="h1" color="white" fontWeight={700} gutterBottom align="center" sx={{ letterSpacing: 0.2, mb: 0.5, textShadow: '0 2px 8px rgba(33,147,176,0.15)' }}>
          Telecast Premium
        </Typography>
        <Typography variant="body1" color="white" align="center" sx={{ opacity: 0.95, fontWeight: 400, maxWidth: 520, mb: 0.5, fontSize: { xs: 14, sm: 16 }, textShadow: '0 2px 8px rgba(33,147,176,0.10)' }}>
          Unlock all features and unlimited podcast uploads
        </Typography>
        <Typography variant="body2" color="white" align="center" sx={{ fontWeight: 400, maxWidth: 520, fontSize: { xs: 12, sm: 14 }, opacity: 0.9 }}>
          Just <b>5 CAD/month</b>
        </Typography>
        
        {/* Trust badges */}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip
            icon={<SecurityIcon />}
            label="Secure"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11 }}
          />
          <Chip
            icon={<SpeedIcon />}
            label="Fast"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11 }}
          />
          <Chip
            icon={<SupportIcon />}
            label="24/7 Support"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11 }}
          />
        </Stack>
      </Box>

      {/* Vibrant card layout */}
      <Container maxWidth="md" sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={8}
          sx={{
            borderRadius: 5,
            p: { xs: 2, sm: 3 },
            boxShadow: '0 12px 40px 0 rgba(33, 147, 176, 0.25)',
            background: 'rgba(255,255,255,0.98)',
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 600,
            mx: 'auto',
            borderTop: '6px solid #2193b0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative corner element */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, transparent 50%, rgba(33,147,176,0.1) 50%)',
              borderRadius: '0 5px 0 60px',
            }}
          />

          <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
            {/* Features list */}
            <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Typography variant="h6" fontWeight={600} color="#2193b0" gutterBottom sx={{ letterSpacing: 0.1, fontSize: { xs: 16, sm: 18 } }}>
                What you get
              </Typography>
              <Stack spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CloudUploadIcon sx={{ color: '#2193b0', fontSize: 18 }} />
                  <Typography fontWeight={500} fontSize={13} color="#222">
                    Unlimited podcast uploads
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <BroadcastOnPersonalIcon sx={{ color: '#6dd5ed', fontSize: 18 }} />
                  <Typography fontWeight={500} fontSize={13} color="#222">
                    Broadcast to all podcast platforms
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EditNoteIcon sx={{ color: '#43cea2', fontSize: 18 }} />
                  <Typography fontWeight={500} fontSize={13} color="#222">
                    Unlimited editing tools
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Divider sx={{ width: '80%', my: 1 }} />

            {/* Additional benefits */}
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 1 }}>
                Plus exclusive benefits:
              </Typography>
              <Stack direction="row" justifyContent="center" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<StarIcon sx={{ fontSize: 14 }} />}
                  label="Premium Support"
                  size="small"
                  sx={{ fontSize: 11, bgcolor: '#f3f4f6' }}
                />
                <Chip
                  icon={<SpeedIcon sx={{ fontSize: 14 }} />}
                  label="Priority Processing"
                  size="small"
                  sx={{ fontSize: 11, bgcolor: '#f3f4f6' }}
                />
                <Chip
                  icon={<SecurityIcon sx={{ fontSize: 14 }} />}
                  label="Enhanced Security"
                  size="small"
                  sx={{ fontSize: 11, bgcolor: '#f3f4f6' }}
                />
              </Stack>
            </Box>

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
                      sx={{ 
                        mt: 2, 
                        mb: 2, 
                        fontSize: 14, 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        textAlign: 'center', 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                        color: 'white',
                        '& .MuiAlert-icon': { color: 'white' }
                      }}
                    >
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
              sx={{ fontWeight: 400, fontSize: 13, opacity: 0.8 }}
              onClick={() => router.push('/')}
            >
              Back to Home
            </Link>
          </Box>
        </Paper>
      </Container>

      {/* Footer info */}
      <Box sx={{ textAlign: 'center', color: 'white', opacity: 0.8, fontSize: 12, position: 'relative', zIndex: 1 }}>
        <Typography variant="caption">
          Secure payment powered by Stripe • Your data is protected
        </Typography>
      </Box>
    </Box>
  );
} 