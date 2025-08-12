'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showPremiumMessage, setShowPremiumMessage] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Show premium message if user is premium
    if (!isLoading && isAuthenticated && user?.isPremium) {
      setShowPremiumMessage(true);
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading while checking user status
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6">Loading...</Typography>
        </Paper>
      </Container>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // If user is premium, show premium message instead of payment form
  if (showPremiumMessage) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)',
          }}
        >
          {/* Decorative background elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 120,
              height: 120,
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
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <CheckCircleIcon sx={{ 
              fontSize: 48, 
              mb: 3, 
              color: '#FCD34D',
              filter: 'drop-shadow(0 4px 8px rgba(252, 211, 77, 0.3))'
            }} />
            
            <Typography variant="h5" fontWeight={700} sx={{ 
              mb: 2, 
              fontSize: '1.75rem',
              letterSpacing: '-0.025em'
            }}>
              You're Already Premium! 🎉
            </Typography>
            
            <Typography variant="body1" sx={{ 
              mb: 4, 
              opacity: 0.9,
              fontSize: '0.95rem',
              lineHeight: 1.6
            }}>
              Your premium subscription is active and you have access to all features
            </Typography>
            
            {user?.premiumExpiresAt && (
              <Box sx={{ 
                mb: 4, 
                p: 2, 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  Premium until: {new Date(user.premiumExpiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            )}
            
            <Button
              variant="contained"
              onClick={() => router.push('/profile')}
              sx={{
                background: 'white',
                color: '#10B981',
                fontWeight: 600,
                px: 4,
                py: 1.25,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '0.875rem',
                boxShadow: '0 4px 12px rgba(255,255,255,0.3)',
                '&:hover': {
                  background: '#F8FAFC',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(255,255,255,0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Go to Profile
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }





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