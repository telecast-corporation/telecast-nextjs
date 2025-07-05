'use client';

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
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { typography, spacing, borderRadius } from '@/styles/typography';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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
            <Typography variant="h4" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, ...typography.title, fontWeight: 700 }}>
          <LockIcon />
          Change Password
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, ...typography.body }}>
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, ...typography.title, color: 'error.main', fontWeight: 700 }}>
          <WarningIcon color="error" />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body1" sx={{ mb: 2, ...typography.body }}>
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