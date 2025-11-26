'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Divider,
  IconButton,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { typography, spacing, borderRadius } from '@/styles/typography';

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPage />
    </Suspense>
  );
}

function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [isCancelingPremium, setIsCancelingPremium] = useState(false);
  const [hasCancelledInCurrentPeriod, setHasCancelledInCurrentPeriod] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Check if user has already cancelled in current period
  useEffect(() => {
    if (user?.isPremium && user?.premiumExpiresAt) {
      const now = new Date();
      const expiryDate = new Date(user.premiumExpiresAt);
      // If premium expires within 24 hours, consider it as cancelled in current period
      const cancelled = expiryDate < new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setHasCancelledInCurrentPeriod(cancelled);
    }
  }, [user]);

  const handleBack = () => {
    router.push('/profile');
  };

  const handleCancel = () => {
    // For now, just go back to profile
    router.push('/profile');
  };

  const handleCancelPremium = async () => {
    setIsCancelingPremium(true);
    try {
      const response = await fetch('/api/payment/cancel-subscription', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSnackbar({ 
          open: true, 
          message: data.message, 
          severity: 'success' 
        });
        
        // Update local state to reflect cancellation
        setHasCancelledInCurrentPeriod(true);
        
        // Refresh session to get updated user data
        setTimeout(async () => {
          try {
            await fetch('/api/auth/session', { method: 'GET' });
            window.location.reload();
          } catch (error) {
            // Failed to refresh session
          }
        }, 2000);
      } else {
        setSnackbar({ 
          open: true, 
          message: data.error || 'Failed to cancel premium subscription', 
          severity: 'error' 
        });
      }
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: 'An error occurred while canceling your premium subscription', 
        severity: 'error' 
      });
    } finally {
      setIsCancelingPremium(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 2 : 3 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 3 : 4 }}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            mr: 2,
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{ 
            ...typography.heading,
            color: 'text.primary',
            fontWeight: 700,
          }}
        >
          Settings
        </Typography>
      </Box>

      {/* Settings Content */}
      <Paper 
        elevation={2}
        sx={{ 
          p: isMobile ? 3 : 4,
          borderRadius: borderRadius.large,
          background: 'background.paper',
        }}
      >
        
        {/* Premium Subscription Settings */}
        <Box sx={{ mb: isMobile ? 3 : 4 }}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              ...typography.subheading,
              color: 'text.primary',
              fontWeight: 600,
              mb: 2,
              fontSize: isMobile ? '1.1rem' : '1.25rem',
            }}
          >
            Subscription
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: isMobile ? 2 : 3,
            borderRadius: borderRadius.medium,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mr: 2,
                color: user?.isPremium ? '#10B981' : '#EF4444',
              }}>
                <StarIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body1"
                  sx={{ 
                    ...typography.body,
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: isMobile ? '0.95rem' : '1rem',
                  }}
                >
                  Premium Subscription
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    ...typography.body,
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.85rem' : '0.875rem',
                  }}
                >
                  {user?.isPremium 
                    ? 'You have an active premium subscription' 
                    : 'Upgrade to premium for unlimited features'
                  }
                </Typography>
              </Box>
            </Box>
            
            {user?.isPremium && !hasCancelledInCurrentPeriod && (
              <Button
                variant="outlined"
                onClick={handleCancelPremium}
                disabled={isCancelingPremium}
                fullWidth={isMobile}
                sx={{
                  color: '#EF4444',
                  borderColor: '#EF4444',
                  fontWeight: 600,
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 1 : 1.5,
                  borderRadius: borderRadius.medium,
                  textTransform: 'none',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  '&:hover': {
                    backgroundColor: '#EF4444',
                    color: 'white',
                    borderColor: '#EF4444',
                  },
                  '&:disabled': {
                    color: '#EF4444',
                    borderColor: '#EF4444',
                    opacity: 0.6,
                  },
                }}
              >
                {isCancelingPremium ? 'Canceling...' : 'Cancel Premium'}
              </Button>
            )}
            {user?.isPremium && hasCancelledInCurrentPeriod && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#10B981', 
                  fontWeight: 500,
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  fontStyle: 'italic',
                  textAlign: isMobile ? 'center' : 'left',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                Subscription cancelled for this period
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: isMobile ? 2 : 3 }} />

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            fullWidth={isMobile}
            sx={{
              ...typography.button,
              px: isMobile ? 2 : 3,
              py: isMobile ? 1 : 1.5,
              borderRadius: borderRadius.medium,
              borderColor: 'primary.main',
              color: 'primary.main',
              fontSize: isMobile ? '0.9rem' : '1rem',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                borderColor: 'primary.main',
              },
            }}
          >
            Back
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: borderRadius.large,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontFamily: "'Open Sans', Arial, sans-serif",
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            fontWeight: 500,
            borderRadius: borderRadius.large,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiAlert-icon': {
              fontSize: isMobile ? '1.1rem' : '1.25rem',
            },
            '& .MuiAlert-message': {
              padding: '8px 0',
            },
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#f0fdf4',
              color: '#166534',
              borderColor: '#bbf7d0',
              '& .MuiAlert-icon': {
                color: '#16a34a',
              },
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              borderColor: '#fecaca',
              '& .MuiAlert-icon': {
                color: '#dc2626',
              },
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
