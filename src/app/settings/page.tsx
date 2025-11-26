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

  useEffect(() => {
    if (user?.isPremium && user?.premiumExpiresAt) {
      const now = new Date();
      const expiryDate = new Date(user.premiumExpiresAt);
      const cancelled = expiryDate < new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setHasCancelledInCurrentPeriod(cancelled);
    }
  }, [user]);

  const handleBack = () => {
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
        setHasCancelledInCurrentPeriod(true);
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
      <Container maxWidth="lg" sx={{ py: isMobile ? spacing.component.xs : spacing.component.md, px: isMobile ? spacing.component.xs : spacing.component.sm }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? spacing.section.xs : spacing.section.md, px: isMobile ? spacing.component.xs : spacing.component.sm }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? spacing.gap.xs : spacing.gap.sm }}>
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
          }}
        >
          Settings
        </Typography>
      </Box>

      <Paper 
        elevation={2}
        sx={{ 
          p: isMobile ? spacing.component.xs : spacing.component.sm,
          borderRadius: borderRadius.large,
          background: 'background.paper',
        }}
      >
        
        <Box sx={{ mb: isMobile ? spacing.gap.sm : spacing.gap.md }}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              ...typography.subheading,
              color: 'text.primary',
              mb: 2,
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
                    fontWeight: 500, // Emphasis
                  }}
                >
                  Premium Subscription
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    ...typography.caption,
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
                fullWidth={isMobile}
                sx={{
                  ...typography.button,
                  color: '#EF4444',
                  borderColor: '#EF4444',
                  borderRadius: borderRadius.medium,
                  textTransform: 'none',
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
                  ...typography.body,
                  color: '#10B981', 
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

        <Divider sx={{ my: isMobile ? spacing.gap.sm : spacing.gap.md }} />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            fullWidth={isMobile}
            sx={{
              ...typography.button,
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            ...typography.body,
            borderRadius: borderRadius.large,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
