"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Avatar,
  Grid,
  Paper,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import {
  Podcasts as PodcastsIcon,
  Radio as RadioIcon,
  MusicNote as MusicNoteIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  Celebration as CelebrationIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface AppleMetadata {
  subtitle: string;
  summary: string;
  keywords: string;
  season: string;
  itunesCategory: string;
}

interface SpotifyMetadata {
  // Add Spotify-specific fields as needed
}

interface GoogleMetadata {
  email: string;
}

interface PodcastMetadata {
  // Episode-specific fields matching the schema exactly
  episodeTitle: string;
  episodeDescription: string;
  episodeNumber: string;
  seasonNumber: string;
  keywords: string;
  explicit: boolean;
  publishDate: string; // Changed from pubDate to publishDate to match schema
  
  // Platform-specific metadata (these will be stored elsewhere)
  apple: AppleMetadata;
  spotify: SpotifyMetadata;
  google: GoogleMetadata;
}

interface Platforms {
  spotify: boolean;
  apple: boolean;
  google: boolean;
  telecast: boolean;
}

const DEFAULT_METADATA: PodcastMetadata = {
  // Episode-specific fields
  episodeTitle: "",
  episodeDescription: "",
  episodeNumber: "",
  seasonNumber: "",
  keywords: "",
  explicit: false,
  publishDate: "",
  
  // Platform-specific
  apple: {
    subtitle: "",
    summary: "",
    keywords: "",
    season: "",
    itunesCategory: "",
  },
  spotify: {},
  google: {
    email: "",
  },
};

export default function BroadcastPage() {
  const theme = useTheme();
  const [metadata, setMetadata] = useState<PodcastMetadata>(DEFAULT_METADATA);
  const [platforms, setPlatforms] = useState<Platforms>({
    spotify: false,
    apple: false,
    google: false,
    telecast: true, // always true
  });
  const [platformStatus, setPlatformStatus] = useState<Platforms>({
    spotify: false,
    apple: false,
    google: false,
    telecast: true,
  });
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectionHistory, setConnectionHistory] = useState<Record<string, boolean>>({});
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successDialog, setSuccessDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    episodeId?: string;
    podcastId?: string;
  }>({
    open: false,
    title: '',
    message: ''
  });
  const router = useRouter();

  // Check for existing uploaded file and platform status on component mount
  useEffect(() => {
    const broadcastReference = sessionStorage.getItem('broadcastReference');
    if (broadcastReference) {
      try {
        const referenceData = JSON.parse(broadcastReference);
        console.log('Found broadcast reference:', referenceData);
        
        // Set the audio file info from the reference
        const audioFileInfo = {
          name: referenceData.originalFileName || 'edited-audio.wav',
          size: 0, // We don't have the actual size, but it's not needed
          type: 'audio/wav',
        } as File;
        
        setAudioFile(audioFileInfo);
        
        // Set the required localStorage data to enable the button
        localStorage.setItem('uploadedAudioFile', JSON.stringify({
          name: audioFileInfo.name,
          size: audioFileInfo.size,
          type: audioFileInfo.type,
          lastModified: Date.now()
        }));
        localStorage.setItem('uploadedAudioFileName', audioFileInfo.name);
        localStorage.setItem('uploadedAudioFileSize', audioFileInfo.size.toString());
        localStorage.setItem('uploadedAudioFileType', audioFileInfo.type);
        // Set a placeholder for uploadedAudioFileData since we don't have the actual file data
        localStorage.setItem('uploadedAudioFileData', 'data:audio/wav;base64,placeholder');
        
      } catch (error) {
        console.error('Error parsing broadcast reference:', error);
      }
    }

    // Check platform connection status
    checkPlatformStatus();
  }, []);

  // Check URL parameters for OAuth results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const message = urlParams.get('message');

    if (success) {
      alert(`Successfully connected to ${success.replace('_connected', '')}!`);
      checkPlatformStatus();
    } else if (error) {
      alert(`Connection failed: ${message || error}`);
    }
  }, []);

  // Gradient backgrounds
  const gradientBg = theme.palette.mode === 'dark'
    ? '#1a1a2e'
    : '#f8fafc';
  
  const cardGradient = theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(255,255,255,0.9)';

  // Autofill logic for platform fields
  const handleMainChange = (field: keyof PodcastMetadata, value: string | boolean) => {
    setMetadata((prev) => {
      const next = { ...prev, [field]: value };
      // Autofill platform fields if they are empty
      if (field === "episodeTitle") {
        if (!prev.apple.subtitle) next.apple.subtitle = value as string;
        if (!prev.apple.summary) next.apple.summary = value as string;
      }
      if (field === "episodeDescription") {
        if (!prev.apple.summary) next.apple.summary = value as string;
      }
      return next;
    });
  };

  const handlePlatformChange = (platform: keyof Pick<PodcastMetadata, 'apple' | 'spotify' | 'google'>, field: string, value: string) => {
    setMetadata((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handlePlatformSelect = (platform: keyof Platforms) => {
    setPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Platform authentication functions
  const checkPlatformStatus = async () => {
    try {
      // Check Spotify connection via Auth0
      const spotifyResponse = await fetch('/api/auth/spotify-token');
      const spotifyData = await spotifyResponse.json();
      
      const status = {
        spotify: spotifyData.connected || false,
        apple: false, // TODO: Implement Apple connection
        google: false, // TODO: Implement Google connection
        telecast: true // Always true since it's our platform
      };
      
      setPlatformStatus(status);
      
      // Update connection history
      setConnectionHistory(prev => ({
        ...prev,
        ...status
      }));
    } catch (error) {
      console.error('Error checking platform status:', error);
    }
  };

  const connectPlatform = async (platform: string) => {
    try {
      setIsConnecting(platform);
      
      // Store connection attempt in history
      setConnectionHistory(prev => ({
        ...prev,
        [platform]: false
      }));
      
      if (platform === 'spotify') {
        // Redirect to Auth0 login with Spotify connection
        window.location.href = `/auth/login?connection=spotify&returnTo=${encodeURIComponent('/broadcast')}`;
      } else {
        // TODO: Implement other platforms
        console.log(`Connecting to ${platform} - not implemented yet`);
        setIsConnecting(null);
      }
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      setIsConnecting(null);
    }
  };

  const disconnectPlatform = async (platform: string) => {
    try {
      const response = await fetch(`/api/auth/podcast-platforms/${platform}/disconnect`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPlatformStatus(prev => ({ ...prev, [platform]: false }));
        setPlatforms(prev => ({ ...prev, [platform]: false }));
      }
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setUploadError('');
      // Immediately save file data to localStorage
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem('uploadedAudioFile', JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }));
        localStorage.setItem('uploadedAudioFileName', file.name);
        localStorage.setItem('uploadedAudioFileSize', file.size.toString());
        localStorage.setItem('uploadedAudioFileType', file.type);
        localStorage.setItem('uploadedAudioFileData', reader.result as string);
        setIsUploading(false);
        setUploadError('');
      };
      setIsUploading(true);
      reader.readAsDataURL(file);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Check if we have a broadcast reference
      const broadcastReference = sessionStorage.getItem('broadcastReference');
      if (!broadcastReference) {
        alert('No audio file found. Please record or upload an audio file first.');
        return;
      }

      const referenceData = JSON.parse(broadcastReference);

      // Validate required fields
      if (!metadata.episodeTitle || !metadata.episodeDescription) {
        alert('Please fill in all required episode fields.');
        return;
      }

      // Prepare data for finalize API
      const finalizeData = {
        referenceId: referenceData.referenceId,
        tempPath: referenceData.tempPath,
        podcastId: referenceData.podcastId,
        metadata: {
          episodeTitle: metadata.episodeTitle,
          episodeDescription: metadata.episodeDescription,
          episodeNumber: metadata.episodeNumber,
          seasonNumber: metadata.seasonNumber,
          keywords: metadata.keywords,
          explicit: metadata.explicit,
          publishDate: metadata.publishDate || new Date().toISOString().split('T')[0],
          apple: metadata.apple,
          spotify: metadata.spotify,
          google: metadata.google,
        }
      };

      // Call the finalize API
      const response = await fetch('/api/podcast/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalizeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to finalize podcast');
      }

      const result = await response.json();
      
      // Broadcast to selected platforms
      const selectedPlatforms = Object.entries(platforms)
        .filter(([platform, enabled]) => enabled && platform !== 'telecast')
        .map(([platform]) => platform);

      if (selectedPlatforms.length > 0) {
        try {
          const broadcastResponse = await fetch('/api/broadcast/platforms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              episodeId: result.episodeId,
              platforms: selectedPlatforms,
              metadata: {
                episodeTitle: metadata.episodeTitle,
                episodeDescription: metadata.episodeDescription,
                episodeNumber: metadata.episodeNumber,
                seasonNumber: metadata.seasonNumber,
                keywords: metadata.keywords,
                explicit: metadata.explicit,
                publishDate: metadata.publishDate || new Date().toISOString().split('T')[0],
                apple: metadata.apple,
                spotify: metadata.spotify,
                google: metadata.google,
              }
            }),
          });

          if (broadcastResponse.ok) {
            const broadcastResult = await broadcastResponse.json();
            console.log('Platform broadcast results:', broadcastResult);
            
            // Show platform-specific results
            const platformResults = Object.entries(broadcastResult.results)
              .filter(([platform, result]) => result && selectedPlatforms.includes(platform))
              .map(([platform, result]) => `${platform}: ${(result as any).success ? 'Success' : 'Failed'}`)
              .join(', ');
            
            setSuccessDialog({
              open: true,
              title: '🎉 Podcast Launched Successfully!',
              message: `"${metadata.episodeTitle}" has been successfully launched to Telecast and ${platformResults}!`,
              episodeId: result.episodeId,
              podcastId: referenceData.podcastId
            });
          } else {
            setSuccessDialog({
              open: true,
              title: '🎉 Podcast Launched Successfully!',
              message: `"${metadata.episodeTitle}" has been successfully launched to Telecast! Platform broadcasting failed.`,
              episodeId: result.episodeId,
              podcastId: referenceData.podcastId
            });
          }
        } catch (broadcastError) {
          console.error('Platform broadcasting error:', broadcastError);
          setSuccessDialog({
            open: true,
            title: '🎉 Podcast Launched Successfully!',
            message: `"${metadata.episodeTitle}" has been successfully launched to Telecast! Platform broadcasting failed.`,
            episodeId: result.episodeId,
            podcastId: referenceData.podcastId
          });
        }
      } else {
        setSuccessDialog({
          open: true,
          title: '🎉 Podcast Launched Successfully!',
          message: `"${metadata.episodeTitle}" has been successfully launched to Telecast!`,
          episodeId: result.episodeId,
          podcastId: referenceData.podcastId
        });
      }
      
      // Clear sessionStorage
      sessionStorage.removeItem('broadcastReference');
      
      // Don't redirect immediately - let user see the success dialog first
      
    } catch (error) {
      console.error('Error finalizing podcast:', error);
      alert(`Error finalizing podcast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'spotify': return <MusicNoteIcon />;
      case 'apple': return <RadioIcon />;
      case 'google': return <SettingsIcon />;
      case 'telecast': return <PodcastsIcon />;
      default: return <RadioIcon />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'spotify': return '#1DB954';
      case 'apple': return '#000000';
      case 'google': return '#4285F4';
      case 'telecast': return theme.palette.primary.main;
      default: return theme.palette.primary.main;
    }
  };

  const getPlatformAccentColor = (platform: string) => {
    switch (platform) {
      case 'spotify': return '#1DB954';
      case 'apple': return '#000000';
      case 'google': return '#4285F4';
      case 'telecast': return '#ff6b35';
      default: return '#ff6b35';
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: gradientBg,
        py: 6,
        px: { xs: 2, sm: 4 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none',
        }
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", position: 'relative', zIndex: 1 }}>
        {/* Progress Indicator */}
        <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 700, 
                mb: 3, 
                textAlign: 'center',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
              }}
            >
              Your Podcast Journey
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: { xs: 24, sm: 28, md: 32 },
                  height: { xs: 24, sm: 28, md: 32 },
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: { xs: 10, sm: 12, md: 14 },
                }}>
                  ✓
                </Box>
                <Typography 
                  variant="body1" 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}
                >
                  Record
                </Typography>
              </Box>
              
              <Box sx={{ width: { xs: 20, sm: 30, md: 40 }, height: 2, bgcolor: theme.palette.primary.main }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: { xs: 24, sm: 28, md: 32 },
                  height: { xs: 24, sm: 28, md: 32 },
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: { xs: 10, sm: 12, md: 14 },
                }}>
                  ✓
                </Box>
                <Typography 
                  variant="body1" 
                  fontWeight={600} 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}
                >
                  Upload
                </Typography>
              </Box>
              
              <Box sx={{ width: { xs: 20, sm: 30, md: 40 }, height: 2, bgcolor: theme.palette.primary.main }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: { xs: 24, sm: 28, md: 32 },
                  height: { xs: 24, sm: 28, md: 32 },
                  borderRadius: '50%',
                  bgcolor: '#ff6b35',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: { xs: 10, sm: 12, md: 14 },
                }}>
                  3
                </Box>
                <Typography 
                  variant="body1" 
                  fontWeight={600} 
                  sx={{ 
                    color: '#ff6b35',
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                  }}
                >
                  Broadcast
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Header Section */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h2" 
            fontWeight={900} 
            mb={2}
            sx={{
              color: theme.palette.primary.main,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem', xl: '4rem' },
              lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 }
            }}
          >
            Broadcast Your Podcast
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            mb={3}
            sx={{ 
              fontWeight: 400, 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              lineHeight: { xs: 1.4, sm: 1.5 }
            }}
          >
            Share your voice with the world across all major podcast platforms
          </Typography>
          
          {/* Platform Stats */}
          <Box display="flex" justifyContent="center" gap={{ xs: 1, sm: 2, md: 3 }} flexWrap="wrap">
            <Chip 
              icon={<CheckCircleIcon />} 
              label="100+ Countries" 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                height: { xs: 28, sm: 32 }
              }} 
            />
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Millions of Listeners" 
              sx={{ 
                bgcolor: '#ff6b35',
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                height: { xs: 28, sm: 32 }
              }} 
            />
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Instant Distribution" 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                height: { xs: 28, sm: 32 }
              }} 
            />
          </Box>
        </Box>

        <Paper 
          sx={{ 
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: cardGradient,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: theme.palette.primary.main,
            }
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* File Upload Section */}
            <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  mb={3} 
                  sx={{ 
                    color: '#ff6b35',
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  Upload Audio File
                </Typography>
                
                {!audioFile ? (
                  <Box sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                    <CloudUploadIcon sx={{ 
                      fontSize: { xs: 36, sm: 42, md: 48 }, 
                      color: 'primary.main', 
                      mb: 2 
                    }} />
                    <Typography 
                      variant="h6" 
                      color="primary" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                      }}
                    >
                      Upload your audio file
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      Please upload the audio file you created in the editor. Supported formats: MP3, WAV, M4A
                    </Typography>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ 
                          py: { xs: 1.5, sm: 2 }, 
                          px: { xs: 3, sm: 4 },
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          minWidth: { xs: 250, sm: 300 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: 'rgba(0,0,0,0.02)',
                          }
                        }}
                      >
                        Click to select audio file
                      </Button>
                    </label>
                  </Box>
                ) : (
                  <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                    <Typography 
                      variant="body1" 
                      color="success.main" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      ✓ Audio file loaded successfully
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      File: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setAudioFile(null)}
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        Change File
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {uploadError && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1, border: '1px solid rgba(244, 67, 54, 0.3)' }}>
                    <Typography 
                      variant="body2" 
                      color="error"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {uploadError}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  mb={3} 
                  sx={{ 
                    color: '#ff6b35',
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  Select Distribution Platforms
                </Typography>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  {Object.entries(platforms).map(([platform, enabled]) => (
                    <Grid item xs={12} sm={6} md={3} key={platform}>
                      <Card
                        sx={{
                          cursor: platform === 'telecast' ? 'default' : 'pointer',
                          transition: 'all 0.3s ease',
                          background: enabled 
                            ? `linear-gradient(135deg, ${getPlatformColor(platform)}15, ${getPlatformAccentColor(platform)}10)`
                            : 'rgba(255,255,255,0.05)',
                          border: enabled 
                            ? `2px solid ${getPlatformColor(platform)}` 
                            : '2px solid rgba(0,0,0,0.1)',
                          '&:hover': {
                            transform: platform === 'telecast' ? 'none' : 'translateY(-2px)',
                            boxShadow: platform === 'telecast' ? 'none' : '0 8px 25px rgba(0,0,0,0.15)',
                          }
                        }}
                        onClick={() => platform !== 'telecast' && handlePlatformSelect(platform as keyof Platforms)}
                      >
                        <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                          <Box
                            sx={{
                              color: enabled ? getPlatformColor(platform) : 'text.secondary',
                              mb: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                            }}
                          >
                            {getPlatformIcon(platform)}
                          </Box>
                          <Typography 
                            variant="h6" 
                            fontWeight={600} 
                            mb={1}
                            sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
                          >
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {platform === 'telecast' ? 'Always included' : enabled ? 'Selected' : 'Click to add'}
                          </Typography>
                          
                          {platform === 'telecast' ? (
                            <Chip 
                              label="Required" 
                              size="small" 
                              color="primary" 
                              sx={{ 
                                mt: 1,
                                fontSize: { xs: '0.625rem', sm: '0.75rem' }
                              }}
                            />
                          ) : (
                            <Box sx={{ mt: 2 }}>
                              {platformStatus[platform as keyof Platforms] ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Chip 
                                    label="Connected" 
                                    size="small" 
                                    color="success" 
                                    sx={{ 
                                      fontSize: { xs: '0.625rem', sm: '0.75rem' }
                                    }}
                                  />
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      disconnectPlatform(platform);
                                    }}
                                    sx={{ 
                                      fontSize: { xs: '0.625rem', sm: '0.75rem' },
                                      py: 0.5,
                                      px: 1
                                    }}
                                  >
                                    Disconnect
                                  </Button>
                                </Box>
                              ) : (
                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={isConnecting === platform}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    connectPlatform(platform);
                                  }}
                                  sx={{ 
                                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                                    py: 0.5,
                                    px: 1,
                                    bgcolor: getPlatformColor(platform),
                                    '&:hover': {
                                      bgcolor: getPlatformAccentColor(platform),
                                    }
                                  }}
                                >
                                  {isConnecting === platform ? 'Connecting...' : 'Connect'}
                                </Button>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Episode Information */}
            <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  mb={3} 
                  sx={{ 
                    color: '#ff6b35',
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  Episode Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12}>
                    <TextField
                      label="Episode Title"
                      value={metadata.episodeTitle}
                      onChange={(e) => handleMainChange("episodeTitle", e.target.value)}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Episode Description"
                      value={metadata.episodeDescription}
                      onChange={(e) => handleMainChange("episodeDescription", e.target.value)}
                      fullWidth
                      multiline
                      minRows={4}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Episode Number"
                      value={metadata.episodeNumber}
                      onChange={(e) => handleMainChange("episodeNumber", e.target.value)}
                      fullWidth
                      type="number"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Season Number"
                      value={metadata.seasonNumber}
                      onChange={(e) => handleMainChange("seasonNumber", e.target.value)}
                      fullWidth
                      type="number"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Keywords (comma-separated)"
                      value={metadata.keywords}
                      onChange={(e) => handleMainChange("keywords", e.target.value)}
                      fullWidth
                      placeholder="podcast, audio, interview, etc."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Publication Date"
                      value={metadata.publishDate}
                      onChange={(e) => handleMainChange("publishDate", e.target.value)}
                      fullWidth
                      type="date"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={metadata.explicit}
                          onChange={(e) => handleMainChange("explicit", e.target.checked)}
                          sx={{
                            color: theme.palette.primary.main,
                            '&.Mui-checked': {
                              color: theme.palette.primary.main,
                            },
                          }}
                        />
                      }
                      label="Explicit Content"
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Platform-Specific Metadata */}
            {platforms.apple && (
              <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: '#ff6b35' }}>
                    Apple Podcasts Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="iTunes Subtitle"
                        value={metadata.apple.subtitle}
                        onChange={(e) => handlePlatformChange("apple", "subtitle", e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="iTunes Summary"
                        value={metadata.apple.summary}
                        onChange={(e) => handlePlatformChange("apple", "summary", e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="iTunes Keywords"
                        value={metadata.apple.keywords}
                        onChange={(e) => handlePlatformChange("apple", "keywords", e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="iTunes Season"
                        value={metadata.apple.season}
                        onChange={(e) => handlePlatformChange("apple", "season", e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="iTunes Category"
                        value={metadata.apple.itunesCategory}
                        onChange={(e) => handlePlatformChange("apple", "itunesCategory", e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {platforms.google && (
              <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: '#ff6b35' }}>
                    Google Podcasts Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Google Play Email"
                        value={metadata.google.email}
                        onChange={(e) => handlePlatformChange("google", "email", e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Box mt={6} display="flex" justifyContent="space-between" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 0 }}>
              <Button 
                variant="outlined"
                onClick={() => router.push('/record')}
                sx={{ 
                  px: { xs: 3, sm: 4 }, 
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Back to Record
              </Button>
              
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={!audioFile || !localStorage.getItem('uploadedAudioFileData')}
                sx={{ 
                  fontWeight: 700, 
                  px: { xs: 4, sm: 6 }, 
                  py: { xs: 1.5, sm: 2 }, 
                  borderRadius: 3,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  background: theme.palette.primary.main,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  '&:hover': {
                    background: theme.palette.primary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.12)',
                    color: 'rgba(0,0,0,0.38)',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Launch Your Podcast
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Success Dialog */}
      <Dialog
        open={successDialog.open}
        onClose={() => setSuccessDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 700,
          pb: 1
        }}>
          <CelebrationIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} />
          {successDialog.title}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.125rem' },
              lineHeight: 1.6,
              mb: 3
            }}
          >
            {successDialog.message}
          </Typography>
          
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.1)', 
            p: 2, 
            borderRadius: 2,
            mb: 2
          }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Your podcast is now live and available to listeners worldwide! 🎧
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setSuccessDialog(prev => ({ ...prev, open: false }))}
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Continue Editing
          </Button>
          
          {successDialog.podcastId && (
            <Button
              onClick={() => {
                setSuccessDialog(prev => ({ ...prev, open: false }));
                router.push(`/podcast/${successDialog.podcastId}`);
              }}
              variant="contained"
              sx={{ 
                bgcolor: 'white',
                color: '#4CAF50',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              View Podcast
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
} 