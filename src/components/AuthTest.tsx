'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';

export default function AuthTest() {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Typography color="error">Error: {error.message}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (user) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {user.picture && (
              <img
                src={user.picture}
                alt="Profile"
                style={{
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  marginBottom: '16px'
                }}
              />
            )}
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {user.email}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              User ID: {user.sub}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email Verified: {user.email_verified ? 'Yes' : 'No'}
            </Typography>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              href="/auth/logout"
              sx={{ mr: 1 }}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom align="center">
          Welcome to Telecast
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Please log in to continue
        </Typography>
        
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            href="/auth/login"
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            href="/auth/login?screen_hint=signup"
          >
            Sign Up
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 