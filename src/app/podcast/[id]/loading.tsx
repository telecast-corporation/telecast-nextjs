import { Box, CircularProgress, Typography, Skeleton, Card, CardContent } from '@mui/material';

export default function PodcastLoading() {
  return (
    <Box sx={{ py: 4 }}>
      {/* Podcast Header Skeleton */}
      <Card sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
            <Skeleton variant="rectangular" width={200} height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="80%" height={60} />
          </Box>
        </CardContent>
      </Card>

      {/* Episodes Section Skeleton */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        
        <Card>
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: 'flex', mb: 2, pb: 2, borderBottom: i < 3 ? '1px solid #eee' : 'none' }}>
                <Skeleton variant="rectangular" width={120} height={120} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
} 