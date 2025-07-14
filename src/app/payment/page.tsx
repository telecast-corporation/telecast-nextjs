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
} 
from '@mui/material';
import SubscriptionForm from '@/components/SubscriptionForm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BroadcastOnPersonalIcon from '@mui/icons-material/BroadcastOnPersonal';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportIcon from '@mui/icons-material/Support';

export default function PaymentPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));





  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left side - Features and Benefits */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: 'fit-content',
              borderRadius: 3,
              background: '#2563EB',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'white', width: 40, height: 40, boxShadow: 2 }}>
                  <CreditCardIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5, fontSize: '1.3rem' }}>
                    Telecast Premium
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                    Unlock all features and unlimited podcast uploads
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" fontWeight={600} sx={{ color: '#FFD700', mb: 3, fontSize: '1.1rem' }}>
                Just $9.99 CAD/month
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1rem' }}>
                  What you get:
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CloudUploadIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                        Unlimited podcast uploads
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        Upload as many episodes as you want
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BroadcastOnPersonalIcon sx={{ color: '#2196F3', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                        Broadcast to all platforms
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        Reach listeners everywhere
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EditNoteIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                        Unlimited editing tools
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        Professional-grade audio editing
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {/* Trust badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<SecurityIcon />}
                  label="Secure"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 10 }}
                />
                <Chip
                  icon={<SpeedIcon />}
                  label="Fast"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 10 }}
                />
                <Chip
                  icon={<SupportIcon />}
                  label="24/7 Support"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 10 }}
                />
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Payment Form */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'white',
              borderTop: '4px solid #2563EB',
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#333', fontSize: '1.1rem' }}>
              Complete Your Subscription
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, color: '#666', fontSize: '0.875rem' }}>
              Enter your payment details to start your premium subscription. You can cancel anytime.
            </Typography>

            {/* Payment form */}
            <Box sx={{ width: '100%' }}>
              <SubscriptionForm />
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link
                component="button"
                underline="hover"
                color="#2563EB"
                sx={{ fontWeight: 400, fontSize: 12, opacity: 0.8 }}
                onClick={() => router.push('/')}
              >
                Back to Home
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer info */}
      <Box sx={{ textAlign: 'center', mt: 4, color: '#666' }}>
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
          Secure payment powered by Stripe • Your data is protected
        </Typography>
      </Box>
    </Container>
  );
} 