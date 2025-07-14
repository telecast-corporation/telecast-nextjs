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
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { typography, spacing, borderRadius } from '@/styles/typography';

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePage />
    </Suspense>
  );
}

function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
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
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle checkout success
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      setSnackbar({
        open: true,
        message: 'Payment successful! Your premium subscription has been activated.',
        severity: 'success',
      });
      // Refresh the page to update the user's premium status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [searchParams]);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      // Force a session refresh by calling the session endpoint
      await fetch('/api/auth/session', { method: 'GET' });
      // Reload the page to get updated user data
      window.location.reload();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh session',
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
  const handleStartFreeTrial = async () => {
    setIsStartingTrial(true);
    try {
      const response = await fetch('/api/auth/start-free-trial', {
        method: 'POST',
      });
      
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        // Fallback if redirect doesn't work
        const data = await response.json();
        if (response.ok) {
          setSnackbar({ open: true, message: data.message, severity: 'success' });
        } else {
          setSnackbar({ open: true, message: data.error, severity: 'error' });
        }
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'An error occurred while starting your free trial', severity: 'error' });
    } finally {
      setIsStartingTrial(false);
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

  if (isLoading) {
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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={user?.image}
              alt={user?.name}
              sx={{ width: 200, height: 200 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: '1.5rem' }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
              {user?.email}
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem' }}>
                Account Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Member since: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Premium Upgrade Section */}
        <Paper 
          sx={{ 
            mt: 4, 
            p: 3, 
            background: '#2563EB',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          {/* Decorative background elements */}
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
              <DiamondIcon sx={{ fontSize: 24, color: '#FCD34D' }} />
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, fontSize: '1.1rem' }}>
                  Upgrade to Premium
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  Unlock unlimited features and enhance your podcasting experience
                </Typography>
                {user?.isPremium && (
                  <Typography variant="caption" sx={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>
                    ✓ Premium Active
                  </Typography>
                )}
                {!user?.isPremium && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 600 }}>
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
                        fontSize: '0.7rem',
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
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                    Unlimited podcast uploads
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                    Broadcast to all podcast platforms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                    Unlimited editing tools
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#FCD34D', fontSize: '1rem' }}>
                    Just $9.99/month
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    Cancel anytime • No setup fees
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<StarIcon />}
                  onClick={() => router.push('/payment')}
                  sx={{
                    background: '#F59E0B',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                    '&:hover': {
                      background: '#D97706',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Upgrade Now
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
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.875rem',
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
                  <Button
                    variant="outlined"
                    onClick={handleStartFreeTrial}
                    disabled={isStartingTrial}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      fontWeight: 500,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {isStartingTrial ? 'Starting Trial...' : 'Start Free Trial (90 Days)'}
                  </Button>
                )}
              </Box>
          </Box>
        </Paper>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setChangePasswordDialogOpen(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Change Password
            </Button>

          <Button
            variant="outlined"
            color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
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
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog 
        open={changePasswordDialogOpen} 
        onClose={() => setChangePasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, ...typography.title, fontWeight: 700, fontSize: '1.1rem' }}>
          <LockIcon />
          Change Password
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, ...typography.body, fontSize: '0.875rem' }}>
            Enter your current password and choose a new password.
          </Typography>
          
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.medium,
                ...typography.input,
              },
              '& .MuiInputLabel-root': {
                ...typography.label,
              },
              '& .MuiOutlinedInput-input': {
                padding: spacing.input,
              },
            }}
          />
          
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.medium,
                ...typography.input,
              },
              '& .MuiInputLabel-root': {
                ...typography.label,
              },
              '& .MuiOutlinedInput-input': {
                padding: spacing.input,
              },
            }}
          />
          
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.medium,
                ...typography.input,
              },
              '& .MuiInputLabel-root': {
                ...typography.label,
              },
              '& .MuiOutlinedInput-input': {
                padding: spacing.input,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setChangePasswordDialogOpen(false)}
            disabled={isChangingPassword}
            variant="outlined"
            sx={{
              ...typography.button,
              padding: spacing.button,
              borderRadius: borderRadius.medium,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            variant="contained"
            sx={{
              ...typography.button,
              padding: spacing.button,
              borderRadius: borderRadius.medium,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, ...typography.title, color: 'error.main', fontWeight: 700, fontSize: '1.1rem' }}>
          <WarningIcon color="error" />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2, ...typography.body, fontSize: '0.875rem' }}>
            To confirm deletion, please type <strong>DELETE</strong> in the field below:
          </Typography>
          <TextField
            fullWidth
            label="Type DELETE to confirm"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            error={deleteConfirmation !== '' && deleteConfirmation !== 'DELETE'}
            helperText={
              deleteConfirmation !== '' && deleteConfirmation !== 'DELETE'
                ? 'Please type DELETE exactly as shown'
                : ''
            }
            sx={{
              mt: 1,
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.medium,
                ...typography.input,
              },
              '& .MuiInputLabel-root': {
                ...typography.label,
              },
              '& .MuiOutlinedInput-input': {
                padding: spacing.input,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            variant="outlined"
            sx={{
              ...typography.button,
              padding: spacing.button,
              borderRadius: borderRadius.medium,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={deleteConfirmation !== 'DELETE' || isDeleting}
            color="error"
            variant="contained"
            sx={{
              ...typography.button,
              padding: spacing.button,
              borderRadius: borderRadius.medium,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>


    </Container>
  );
} 