'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
} from '@mui/material';
import {
  MusicNote as SpotifyIcon,
  Apple as AppleIcon,
  Google as GoogleIcon,
  YouTube as YouTubeIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface Episode {
  id: string;
  title: string | null;
  description: string | null;
  audioUrl: string;
  isFinal: boolean;
  isPublished: boolean;
  duration: number | null;
  fileSize: number | null;
  episodeNumber?: number | null;
  seasonNumber?: number | null;
  keywords: string[];
  explicit: boolean;
}

interface PlatformConnection {
  id: string;
  platform: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

interface DistributionResult {
  platform: string;
  success: boolean;
  message: string;
  url?: string;
}

export default function DistributeEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.id as string;
  const episodeId = params.episodeId as string;
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [platformConnections, setPlatformConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distributionResults, setDistributionResults] = useState<DistributionResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch episode data
        const episodeResponse = await fetch(`/api/podcast/internal/${podcastId}/episode/${episodeId}`);
        if (!episodeResponse.ok) {
          throw new Error('Failed to fetch episode');
        }
        const episodeData = await episodeResponse.json();
        setEpisode(episodeData);

        // Fetch platform connections
        const connectionsResponse = await fetch('/api/contacts');
        if (connectionsResponse.ok) {
          const connectionsData = await connectionsResponse.json();
          setPlatformConnections(connectionsData.platformConnections || []);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load episode or platform connections');
      } finally {
        setLoading(false);
      }
    };

    if (podcastId && episodeId) {
      fetchData();
    }
  }, [podcastId, episodeId]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return <SpotifyIcon />;
      case 'apple':
        return <AppleIcon />;
      case 'google':
        return <GoogleIcon />;
      case 'youtube':
        return <YouTubeIcon />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return '#1DB954';
      case 'apple':
        return '#000000';
      case 'google':
        return '#4285F4';
      case 'youtube':
        return '#FF0000';
      default:
        return '#666666';
    }
  };

  const handleDistributeToAll = async () => {
    try {
      setDistributing(true);
      setError(null);
      setDistributionResults([]);

      const results: DistributionResult[] = [];

      for (const connection of platformConnections) {
        try {
          const response = await fetch('/api/broadcast/quick', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              episodeId,
              platform: connection.platform,
              useRememberedPlatforms: false,
            }),
          });

          const result = await response.json();
          
          results.push({
            platform: connection.platform,
            success: response.ok,
            message: response.ok ? 'Successfully distributed' : result.error || 'Distribution failed',
            url: result.url,
          });
        } catch (error) {
          results.push({
            platform: connection.platform,
            success: false,
            message: 'Network error',
          });
        }
      }

      setDistributionResults(results);
      
    } catch (error) {
      console.error('Error distributing episode:', error);
      setError('Failed to distribute episode');
    } finally {
      setDistributing(false);
    }
  };

  const handleDistributeToPlatform = async (platform: string) => {
    try {
      setDistributing(true);
      setError(null);

      const response = await fetch('/api/broadcast/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episodeId,
          platform,
          useRememberedPlatforms: false,
        }),
      });

      const result = await response.json();
      
      const distributionResult: DistributionResult = {
        platform,
        success: response.ok,
        message: response.ok ? 'Successfully distributed' : result.error || 'Distribution failed',
        url: result.url,
      };

      setDistributionResults([distributionResult]);
      
    } catch (error) {
      console.error('Error distributing episode:', error);
      setError('Failed to distribute episode');
    } finally {
      setDistributing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !episode) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">
          {error || 'Episode not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/podcast/${podcastId}`)}
        >
          Back to Podcast
        </Button>
        <Typography variant="h4" component="h1">
          Distribute Episode
        </Typography>
      </Box>

      {/* Episode Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Episode Details
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Title:</strong> {episode.title || 'Untitled Episode'}
        </Typography>
        {episode.description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Description:</strong> {episode.description}
          </Typography>
        )}
        {episode.fileSize && (
          <Typography variant="body2" color="text.secondary">
            <strong>File Size:</strong> {(episode.fileSize / 1024 / 1024).toFixed(2)} MB
          </Typography>
        )}
      </Paper>

      {/* Platform Connections */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Connected Platforms ({platformConnections.length})
        </Typography>
        
        {platformConnections.length === 0 ? (
          <Alert severity="info">
            No platform connections found. Please connect your platforms first.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {platformConnections.map((connection) => (
              <Card key={connection.id} variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: getPlatformColor(connection.platform) }}>
                    {getPlatformIcon(connection.platform)}
                  </Box>
                  <Typography variant="subtitle1" sx={{ flex: 1 }}>
                    {connection.platform.charAt(0).toUpperCase() + connection.platform.slice(1)}
                  </Typography>
                  <Chip 
                    label="Connected" 
                    color="success" 
                    size="small" 
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleDistributeToPlatform(connection.platform)}
                    disabled={distributing}
                  >
                    Distribute to {connection.platform}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Distribution Actions */}
      {platformConnections.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Distribution Actions
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleDistributeToAll}
            disabled={distributing}
            sx={{ mb: 2 }}
          >
            {distributing ? 'Distributing...' : 'Distribute to All Platforms'}
          </Button>
        </Paper>
      )}

      {/* Distribution Results */}
      {distributionResults.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Distribution Results
          </Typography>
          <Stack spacing={2}>
            {distributionResults.map((result, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  border: 1,
                  borderColor: result.success ? 'success.main' : 'error.main',
                  borderRadius: 1,
                  bgcolor: result.success ? 'success.50' : 'error.50',
                }}
              >
                {result.success ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">
                    {result.platform.charAt(0).toUpperCase() + result.platform.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.message}
                  </Typography>
                </Box>
                {result.url && (
                  <Button
                    size="small"
                    variant="outlined"
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
} 