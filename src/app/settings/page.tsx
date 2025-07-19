'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
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
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
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
          variant="h4" 
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
          p: 4,
          borderRadius: borderRadius.large,
          background: 'background.paper',
        }}
      >
        {/* Theme Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              ...typography.subheading,
              color: 'text.primary',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Appearance
          </Typography>
          
                     <Box sx={{ 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'space-between',
             p: 2,
             borderRadius: borderRadius.medium,
             border: '1px solid',
             borderColor: 'divider',
             backgroundColor: 'background.default',
           }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mr: 2,
                color: 'primary.main',
              }}>
                {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
              </Box>
              <Box>
                                 <Typography 
                   variant="body1"
                   sx={{ 
                     ...typography.body,
                     color: 'text.primary',
                     fontWeight: 500,
                   }}
                 >
                   Dark Mode
                 </Typography>
                 <Typography 
                   variant="body2"
                   sx={{ 
                     ...typography.body,
                     color: 'text.secondary',
                   }}
                 >
                   Switch between light and dark themes
                 </Typography>
              </Box>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        opacity: 0.1,
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              }
              label=""
            />
          </Box>
        </Box>

        {/* Premium Subscription Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              ...typography.subheading,
              color: 'text.primary',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Subscription
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderRadius: borderRadius.medium,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mr: 2,
                color: user?.isPremium ? '#10B981' : '#EF4444',
              }}>
                <StarIcon />
              </Box>
              <Box>
                <Typography 
                  variant="body1"
                  sx={{ 
                    ...typography.body,
                    color: 'text.primary',
                    fontWeight: 500,
                  }}
                >
                  Premium Subscription
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    ...typography.body,
                    color: 'text.secondary',
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
                sx={{
                  color: '#EF4444',
                  borderColor: '#EF4444',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: borderRadius.medium,
                  textTransform: 'none',
                  fontSize: '0.875rem',
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
                  fontSize: '0.875rem',
                  fontStyle: 'italic'
                }}
              >
                Subscription cancelled for this period
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: 2,
        }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              ...typography.button,
              px: 3,
              py: 1.5,
              borderRadius: borderRadius.medium,
              borderColor: 'primary.main',
              color: 'primary.main',
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
            fontSize: '0.95rem',
            fontWeight: 500,
            borderRadius: borderRadius.large,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiAlert-icon': {
              fontSize: '1.25rem',
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