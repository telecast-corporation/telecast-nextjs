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
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  MusicNote as SpotifyIcon,
  Apple as AppleIcon,
  YouTube as YouTubeIcon,
  Podcasts as PodcastIndexIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  author: string;
  category: string;
  language: string;
  explicit: boolean;
  tags: string[];
}

export default function DistributePodcastPage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.id as string;
  
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rssUrl, setRssUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showRssModal, setShowRssModal] = useState(false);
  const [rssModalPlatform, setRssModalPlatform] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/podcast/internal/${podcastId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch podcast');
        }
        
        const podcastData = await response.json();
        setPodcast(podcastData);
        
        // Generate RSS URL
        const baseUrl = window.location.origin;
        setRssUrl(`${baseUrl}/api/podcast/internal/${podcastId}/rss`);
        
      } catch (error) {
        console.error('Error fetching podcast:', error);
        setError('Failed to load podcast');
      } finally {
        setLoading(false);
      }
    };

    if (podcastId) {
      fetchPodcast();
    }
  }, [podcastId]);

  const handleCopyRssUrl = async () => {
    try {
      await navigator.clipboard.writeText(rssUrl);
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy RSS URL:', error);
    }
  };

  const handleCloseCopySuccess = () => {
    setCopySuccess(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return <SpotifyIcon />;
      case 'apple':
        return <AppleIcon />;
      case 'youtube':
        return <YouTubeIcon />;
      case 'podcast-index':
        return <PodcastIndexIcon />;
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
      case 'youtube':
        return '#FF0000';
      case 'podcast-index':
        return '#FF6B35';
      default:
        return '#666666';
    }
  };

  const getPlatformSubmitUrl = (platform: string) => {
    const baseUrl = window.location.origin;
    const rssFeedUrl = encodeURIComponent(`${baseUrl}/api/podcast/internal/${podcastId}/rss`);
    
    switch (platform.toLowerCase()) {
      case 'spotify':
        return `https://podcasters.spotify.com/pod/dashboard/episode/${rssFeedUrl}`;
      case 'apple':
        return `https://podcastsconnect.apple.com/onboarding`;
      case 'youtube':
        return `https://studio.youtube.com`;
      case 'podcast-index':
        return `https://podcastindex.org/add`;
      default:
        return '#';
    }
  };

  const handlePlatformSelect = (platform: string) => {
    // Platforms that don't allow iframe embedding
    const noIframePlatforms = ['apple', 'youtube'];
    
    if (noIframePlatforms.includes(platform.toLowerCase())) {
      // Show RSS modal first, then open in new tab
      setRssModalPlatform(platform);
      setShowRssModal(true);
    } else {
      // Use iframe for platforms that allow it
      setSelectedPlatform(platform);
    }
  };

  const handleOpenInNewTab = () => {
    if (rssModalPlatform) {
      window.open(getPlatformSubmitUrl(rssModalPlatform), '_blank');
      setShowRssModal(false);
      setRssModalPlatform(null);
    }
  };

  const handleCloseRssModal = () => {
    setShowRssModal(false);
    setRssModalPlatform(null);
  };

  const handleCloseIframe = () => {
    setSelectedPlatform(null);
  };

  const platforms = [
    { name: 'Spotify', key: 'spotify' },
    { name: 'Apple Podcasts', key: 'apple' },
    { name: 'YouTube', key: 'youtube' },
    { name: 'Podcast Index', key: 'podcast-index' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !podcast) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">
          {error || 'Podcast not found'}
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
          Distribute Podcast
        </Typography>
      </Box>

      {/* Podcast Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Podcast Details
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Title:</strong> {podcast.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Author:</strong> {podcast.author}
        </Typography>
        {podcast.description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Description:</strong> {podcast.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip label={podcast.category} size="small" />
          <Chip label={podcast.language} size="small" variant="outlined" />
          {podcast.explicit && <Chip label="Explicit" size="small" color="warning" />}
        </Box>
      </Paper>

      {/* Platform Distribution */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submit to Podcast Platforms
        </Typography>
        
        <Stack spacing={2}>
          {platforms.map((platform) => (
            <Card key={platform.key} variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: getPlatformColor(platform.key) }}>
                  {getPlatformIcon(platform.key)}
                </Box>
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {platform.name}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => handlePlatformSelect(platform.key)}
                  sx={{ 
                    backgroundColor: getPlatformColor(platform.key),
                    '&:hover': {
                      backgroundColor: getPlatformColor(platform.key),
                      opacity: 0.8,
                    }
                  }}
                >
                  Submit to {platform.name}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Paper>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseCopySuccess}
        message="RSS URL copied to clipboard!"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseCopySuccess}
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Platform Iframe Modal */}
      {selectedPlatform && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              backgroundColor: 'white',
              p: 2,
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="h6">
                Submit to {platforms.find(p => p.key === selectedPlatform)?.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all', flex: 1 }}>
                  RSS Feed: {rssUrl}
                </Typography>
                <Tooltip title="Copy RSS URL">
                  <IconButton 
                    size="small" 
                    onClick={handleCopyRssUrl} 
                    color="primary"
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              {selectedPlatform === 'youtube' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  In YouTube Studio, click Create and then New podcast and then Submit RSS feed.
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              onClick={handleCloseIframe}
              sx={{ minWidth: 'auto' }}
            >
              Close
            </Button>
          </Box>
          <Box
            sx={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <iframe
              src={getPlatformSubmitUrl(selectedPlatform)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title={
                selectedPlatform === 'youtube' 
                  ? `Submit to ${platforms.find(p => p.key === selectedPlatform)?.name} - RSS Feed: ${rssUrl} - In YouTube Studio, click Create and then New podcast and then Submit RSS feed.`
                  : `Submit to ${platforms.find(p => p.key === selectedPlatform)?.name} - RSS Feed: ${rssUrl}`
              }
            />
          </Box>
        </Box>
      )}

      {/* RSS Modal for platforms that don't allow iframe */}
      {showRssModal && rssModalPlatform && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Paper
            sx={{
              p: 3,
              maxWidth: 500,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Submit to {platforms.find(p => p.key === rssModalPlatform)?.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Copy the RSS feed URL below and paste it into the platform's submission form:
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TextField
                value={rssUrl}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
              />
              <Tooltip title="Copy RSS URL">
                <IconButton onClick={handleCopyRssUrl} color="primary">
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {rssModalPlatform === 'youtube' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Instructions:</strong> In YouTube Studio, click Create and then New podcast and then Submit RSS feed.
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleCloseRssModal}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleOpenInNewTab}>
                Open {platforms.find(p => p.key === rssModalPlatform)?.name}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
