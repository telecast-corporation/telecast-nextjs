'use client';

import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { typography, spacing, borderRadius } from '@/styles/typography';

function FreeTrialResultContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    expiresAt?: string;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Get result from URL parameters
    const success = searchParams.get('success') === 'true';
    const message = searchParams.get('message') || '';
    const expiresAt = searchParams.get('expiresAt');

    if (success || message) {
      setResult({
        success,
        message: decodeURIComponent(message),
        expiresAt: expiresAt ? decodeURIComponent(expiresAt) : undefined,
      });
    }
  }, [isLoading, isAuthenticated, router, searchParams]);

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  const handleGoToPayment = () => {
    router.push('/payment');
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!result) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography>No trial result found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: borderRadius.large,
          background: result.success 
            ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
            : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          color: '#1e293b',
          border: result.success 
            ? '1px solid rgba(34, 197, 94, 0.2)'
            : '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {result.success ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              mb: 3,
              mx: 'auto',
            }}>
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 60, 
                  color: 'white',
                }} 
              />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
              mb: 3,
              mx: 'auto',
            }}>
              <StarIcon 
                sx={{ 
                  fontSize: 60, 
                  color: 'white',
                }} 
              />
            </Box>
          )}
          
          <Typography 
            variant="h3" 
            sx={{ 
              ...typography.title, 
              fontWeight: 800, 
              fontSize: '2rem',
              mb: 2,
              background: result.success 
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
            }}
          >
            {result.success ? 'Free Trial Activated!' : 'Upgrade to Premium'}
          </Typography>
          
                      <Typography 
              variant="body1" 
              sx={{ 
                ...typography.body, 
                fontSize: '1.1rem',
                opacity: 0.8,
                mb: 3,
                lineHeight: 1.6,
                maxWidth: 500,
                mx: 'auto',
                color: '#475569',
              }}
            >
              {result.success 
                ? 'Your free trial is now active! Enjoy all premium features for the next 90 days.'
                : 'You\'ve already used your free trial. Upgrade to premium to unlock unlimited features and continue creating amazing content!'
              }
            </Typography>
        </Box>

        {result.success && result.expiresAt && (
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: borderRadius.large,
            p: 3,
            mb: 3,
            textAlign: 'center',
          }}>
            <Typography sx={{ 
              fontWeight: 600, 
              fontSize: '1rem',
              color: '#10B981',
              mb: 1,
            }}>
              🎉 Trial Active Until
            </Typography>
            <Typography sx={{ 
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#10B981',
              mb: 1,
            }}>
              {new Date(result.expiresAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
            <Typography sx={{ 
              fontSize: '0.9rem',
              opacity: 0.8,
              color: '#475569',
            }}>
              Enjoy all premium features until then!
            </Typography>
          </Box>
        )}

        {!result.success && (
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: borderRadius.large,
            p: 3,
            mb: 3,
            textAlign: 'center',
          }}>
            <Typography sx={{ 
              fontWeight: 600, 
              fontSize: '1rem',
              color: '#EF4444',
              mb: 1,
            }}>
              ⭐ Premium Features Await
            </Typography>
            <Typography sx={{ 
              fontSize: '1rem',
              color: '#475569',
              mb: 2,
              lineHeight: 1.5,
            }}>
              Unlock unlimited podcast uploads, advanced editing tools, and broadcast to all platforms
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2, 
              flexWrap: 'wrap',
              fontSize: '0.85rem',
              color: '#64748b',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                ✓ Unlimited uploads
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                ✓ Advanced editing
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                ✓ Multi-platform broadcast
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoToProfile}
            sx={{
              color: '#475569',
              borderColor: 'rgba(71, 85, 105, 0.3)',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#475569',
                backgroundColor: 'rgba(71, 85, 105, 0.1)',
              },
            }}
          >
            Back to Profile
          </Button>

          <Button
            variant="contained"
            startIcon={<StarIcon />}
            onClick={handleGoToPayment}
            sx={{
              background: '#F59E0B',
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 1.5,
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
            {result.success ? 'Upgrade to Premium' : 'Get Premium Now'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default function FreeTrialResultPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography>Loading...</Typography>
      </Container>
    }>
      <FreeTrialResultContent />
    </Suspense>
  );
} 