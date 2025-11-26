'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  Container, 
  Typography, 
  Avatar, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import { 
  LogoutOutlined as LogoutIcon,
  DeleteForever as DeleteIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { typography, spacing, borderRadius } from '@/styles/typography';
import StartFreeTrial from '@/components/StartFreeTrial';

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePage />
    </Suspense>
  );
}

function ProfilePage() {
  const { user: authUser, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<{
    eligible: boolean;
    price: number;
    message: string;
    daysSinceTrialEnd?: number;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          setUserLoading(true);
          const response = await fetch('/api/profile');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setUserLoading(false);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  // Fetch pricing information
  useEffect(() => {
    const fetchPricingInfo = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/pricing/check-discount');
          if (response.ok) {
            const pricingData = await response.json();
            setPricingInfo(pricingData);
          }
        } catch (error) {
          console.error('Error fetching pricing info:', error);
        }
      }
    };

    fetchPricingInfo();
  }, [isAuthenticated]);

  // Handle checkout success
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      setSnackbar({
        open: true,
        message: 'Payment successful! Your premium subscription has been activated.',
        severity: 'success',
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
      
      setTimeout(async () => {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          // Failed to refresh user data
        }
      }, 2000);
    }
  }, [searchParams]);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setSnackbar({
          open: true,
          message: 'User data refreshed successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to refresh user data',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh user data',
        severity: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Password changed successfully',
          severity: 'success',
        });
        setChangePasswordDialogOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Failed to change password',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while changing your password',
        severity: 'error',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Account deleted successfully',
          severity: 'success',
        });
        setTimeout(() => {
          logout();
          router.push('/');
        }, 2000);
      } else {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: data.error || 'Failed to delete account',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting your account',
        severity: 'error',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmation('');
    }
  };

  if (isLoading || userLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: isMobile ? 2 : 4, px: isMobile ? 2 : 3 }}>
      <Paper sx={{ p: isMobile ? 2 : 4, borderRadius: borderRadius.large }}>
        <Grid container spacing={isMobile ? 2 : 4}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Avatar
              src={user?.image}
              alt={user?.name}
              sx={{ width: isMobile ? 120 : 200, height: isMobile ? 120 : 200, mb: 2 }}
            />
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ textAlign: 'center', ...typography.heading }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', ...typography.body }}>
              {user?.email}
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ ...typography.heading }}>
              Account Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ...typography.body }}>
              Member since: {new Date().toLocaleDateString()}
            </Typography>
            
            <Divider sx={{ my: 3 }} />

            <Paper 
              sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: borderRadius.medium,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
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
                  background: 'rgba(255,255,255,0.04)',
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <DiamondIcon sx={{ fontSize: 28, color: '#FCD34D' }} />
                  <Box>
                    <Typography variant="h6" sx={{ ...typography.heading, fontSize: '1.2rem' }}>
                      Upgrade to Premium
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, ...typography.body }}>
                      Unlock exclusive features and enhance your experience.
                    </Typography>
                    {user?.isPremium && (
                      <Typography variant="caption" sx={{ color: '#10B981', ...typography.caption, fontWeight: 'bold' }}>
                        ✓ Premium Active
                      </Typography>
                    )}
                    {!user?.isPremium && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#EF4444', ...typography.caption, fontWeight: 'bold' }}>
                          ⚠️ Premium Inactive
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={handleRefreshSession}
                          disabled={isRefreshing}
                          sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            ...typography.button,
                            color: '#EF4444',
                            borderColor: '#EF4444',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            },
                          }}
                        >
                          {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                      <Typography variant="body2" sx={{ ...typography.body, fontSize: '0.8rem' }}>
                        Unlimited podcast uploads
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                      <Typography variant="body2" sx={{ ...typography.body, fontSize: '0.8rem' }}>
                        Unlimited editing tools
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                      <Typography variant="body2" sx={{ ...typography.body, fontSize: '0.8rem' }}>
                        Broadcast to other podcast platforms
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#FCD34D', fontSize: '1rem' }}>
                        Just ${pricingInfo?.price || 17.99}/month
                        {pricingInfo?.eligible && (
                          <Typography component="span" sx={{ 
                            color: '#10B981', 
                            fontSize: '0.8rem', 
                            ml: 1,
                            fontWeight: 'bold'
                          }}>
                            (Special Discount!)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        Cancel anytime • No setup fees
                        {pricingInfo?.eligible && pricingInfo.daysSinceTrialEnd !== undefined && (
                          <span style={{ color: '#10B981', fontWeight: 'bold' }}>
                            {' '}• {30 - pricingInfo.daysSinceTrialEnd} days left for discount
                          </span>
                        )}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<StarIcon />}
                      onClick={() => user?.isPremium ? setSubscriptionDialogOpen(true) : router.push('/payment')}
                      sx={{
                        background: user?.isPremium ? '#10B981' : '#F59E0B',
                        color: 'white',
                        ...typography.button,
                        borderRadius: borderRadius.medium,
                        textTransform: 'none',
                        boxShadow: user?.isPremium 
                          ? '0 2px 8px rgba(16, 185, 129, 0.3)' 
                          : '0 2px 8px rgba(245, 158, 11, 0.3)',
                        '&:hover': {
                          background: user?.isPremium ? '#059669' : '#D97706',
                          boxShadow: user?.isPremium 
                            ? '0 4px 12px rgba(16, 185, 129, 0.4)' 
                            : '0 4px 12px rgba(245, 158, 11, 0.4)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {user?.isPremium ? 'My Subscription' : 'Upgrade Now'}
                    </Button>
                    {user?.usedFreeTrial ? (
                      <Button
                        variant="outlined"
                        disabled
                        startIcon={<CheckCircleIcon />}
                        sx={{
                          color: '#10B981',
                          borderColor: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          ...typography.button,
                          borderRadius: borderRadius.medium,
                          textTransform: 'none',
                          cursor: 'not-allowed',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                          '&:disabled': {
                            color: '#10B981',
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          },
                          '& .MuiButton-startIcon': {
                            color: '#10B981',
                          },
                        }}
                      >
                        Free Trial Used ✓
                      </Button>
                    ) : (
                      <StartFreeTrial
                        variant="outlined"
                        children="Start Free Trial (90 Days)"
                      />
                    )}
                  </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, flexDirection: isMobile ? 'column-reverse' : 'row' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => router.push('/settings')}
              fullWidth={isMobile}
              sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none' }}
            >
              Settings
            </Button>

            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setChangePasswordDialogOpen(true)}
              fullWidth={isMobile}
              sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none' }}
            >
              Change Password
            </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            fullWidth={isMobile}
            sx={{
              ...typography.button,
              borderRadius: borderRadius.medium,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white',
                borderColor: 'error.main',
              },
            }}
            >
              Delete Account
            </Button>
          </Box>

          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={logout}
            fullWidth={isMobile}
            sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none' }}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>

      <Dialog 
        open={changePasswordDialogOpen} 
        onClose={() => setChangePasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: borderRadius.large } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, ...typography.title }}>
          <LockIcon />
          Change Password
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, ...typography.body }}>
            Enter your current password and choose a new password.
          </Typography>
          
          <TextField
            fullWidth
            type="password"
            label="Current Password *"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: borderRadius.medium } }}
          />
          
          <TextField
            fullWidth
            type="password"
            label="New Password *"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: borderRadius.medium } }}
          />
          
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password *"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: borderRadius.medium } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setChangePasswordDialogOpen(false)}
            disabled={isChangingPassword}
            variant="outlined"
            sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            variant="contained"
            sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none' }}
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={subscriptionDialogOpen} 
        onClose={() => setSubscriptionDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: borderRadius.large, border: '1px solid #e5e7eb' } }}
      >
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#10B981', mb: 2 }}>
            <DiamondIcon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2, color: '#1F2937', ...typography.heading, fontSize: '1.2rem' }}>
            Premium Subscription
          </Typography>
          
          {user?.premiumExpiresAt && (
            <Box sx={{ p: 2, background: '#FEF3C7', borderRadius: borderRadius.medium, border: '1px solid #F59E0B', mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#92400E', ...typography.body, fontSize: '0.8rem', fontWeight: 'bold' }}>
                Subscription ends
              </Typography>
              <Typography variant="h6" sx={{ color: '#92400E', fontSize: '1rem' }}>
                {new Date(user.premiumExpiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" sx={{ color: '#6B7280', ...typography.body, lineHeight: 1.5, mb: 3 }}>
            Your subscription will automatically renew unless canceled.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 4, pb: 3, gap: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setSubscriptionDialogOpen(false)}
            variant="outlined"
            sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none', borderColor: '#D1D5DB', color: '#6B7280', '&:hover': { borderColor: '#9CA3AF', backgroundColor: 'rgba(156, 163, 175, 0.04)' } }}
          >
            Close
          </Button>
          <Button
            onClick={() => { setSubscriptionDialogOpen(false); router.push('/settings'); }}
            variant="contained"
            sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none', background: '#10B981', '&:hover': { background: '#059669' } }}
          >
            Manage
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: borderRadius.large } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, ...typography.title, color: 'error.main' }}>
          <WarningIcon color="error" />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: borderRadius.medium }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2, ...typography.body }}>
            To confirm deletion, please type <strong>DELETE</strong> in the field below:
          </Typography>
          <TextField
            fullWidth
            label="Type DELETE to confirm"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            error={deleteConfirmation !== '' && deleteConfirmation !== 'DELETE'}
            helperText={deleteConfirmation !== '' && deleteConfirmation !== 'DELETE' ? 'Please type DELETE exactly as shown' : ''}
            sx={{ mt: 1, mb: 1, '& .MuiOutlinedInput-root': { borderRadius: borderRadius.medium } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            variant="outlined"
            sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={deleteConfirmation !== 'DELETE' || isDeleting}
            color="error"
            variant="contained"
            sx={{ ...typography.button, borderRadius: borderRadius.medium, textTransform: 'none' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: borderRadius.medium, ...typography.body, fontWeight: 'bold' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>


    </Container>
  );
} 
