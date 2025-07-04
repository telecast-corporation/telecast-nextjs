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
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import {
  Podcasts as PodcastsIcon,
  Radio as RadioIcon,
  MusicNote as MusicNoteIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
  // ... add more as needed
];

const CATEGORIES = [
  "Arts",
  "Business",
  "Comedy",
  "Education",
  "Health & Fitness",
  "Music",
  "News",
  "Religion & Spirituality",
  "Science",
  "Sports",
  "Technology",
  "TV & Film",
  // ... add more as needed
];

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
  title: string;
  description: string;
  author: string;
  language: string;
  category: string;

  explicit: boolean;
  episodeTitle: string;
  episodeDescription: string;
  episodeType: string;
  episodeNumber: string;
  pubDate: string;
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
  title: "",
  description: "",
  author: "",
  language: "en",
  category: "",

  explicit: false,
  episodeTitle: "",
  episodeDescription: "",
  episodeType: "full",
  episodeNumber: "",
  pubDate: "",
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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  // Check for existing uploaded file on component mount
  useEffect(() => {
    const existingFileData = localStorage.getItem('uploadedAudioFile');
    if (existingFileData) {
      try {
        const fileInfo = JSON.parse(existingFileData);
        // Create a mock file object from stored data
        const mockFile = new File([new ArrayBuffer(fileInfo.size)], fileInfo.name, {
          type: fileInfo.type,
          lastModified: fileInfo.lastModified
        });
        setAudioFile(mockFile);
      } catch (error) {
        console.error('Error parsing stored file data:', error);
      }
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
      if (field === "title") {
        if (!prev.apple.subtitle) next.apple.subtitle = value as string;
        if (!prev.apple.summary) next.apple.summary = value as string;
      }
      if (field === "description") {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setUploadError('');
    }
  };

  const handleFileSave = async () => {
    if (!audioFile) {
      setUploadError('Please upload an audio file first');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = () => {
        // Store file data in localStorage
        localStorage.setItem('uploadedAudioFile', JSON.stringify({
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type,
          lastModified: audioFile.lastModified
        }));
        localStorage.setItem('uploadedAudioFileName', audioFile.name);
        localStorage.setItem('uploadedAudioFileSize', audioFile.size.toString());
        localStorage.setItem('uploadedAudioFileType', audioFile.type);
        localStorage.setItem('uploadedAudioFileData', reader.result as string);
        
        setIsUploading(false);
        setUploadError('');
      };
      reader.readAsDataURL(audioFile);
    } catch (error) {
      setUploadError('Error saving file. Please try again.');
      setIsUploading(false);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Check if file is uploaded and saved
      if (!audioFile) {
        alert('Please upload an audio file first.');
        return;
      }

      // Check if file is saved to localStorage
      const audioFileData = localStorage.getItem('uploadedAudioFileData');
      const audioFileName = localStorage.getItem('uploadedAudioFileName');
      const audioFileSize = localStorage.getItem('uploadedAudioFileSize');
      const audioFileType = localStorage.getItem('uploadedAudioFileType');
      
      if (!audioFileData || !audioFileName || !audioFileSize || !audioFileType) {
        alert('Please save your audio file first by clicking the "Save File" button.');
        return;
      }

      // Validate required fields
      if (!metadata.title || !metadata.description || !metadata.author || 
          !metadata.episodeTitle || !metadata.episodeDescription) {
        alert('Please fill in all required fields.');
        return;
      }

      // Prepare data for API
      const broadcastData = {
        title: metadata.title,
        description: metadata.description,
        author: metadata.author,
        language: metadata.language,
        category: metadata.category,
        explicit: metadata.explicit,
        episodeTitle: metadata.episodeTitle,
        episodeDescription: metadata.episodeDescription,
        episodeType: metadata.episodeType,
        episodeNumber: metadata.episodeNumber,
        pubDate: metadata.pubDate || new Date().toISOString().split('T')[0],
        audioFileName,
        audioFileSize: parseInt(audioFileSize),
        audioFileType,
        audioFileData,
      };

      // Call the API
      const response = await fetch('/api/telecast-podcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(broadcastData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to broadcast podcast');
      }

      const result = await response.json();
      
      // Clear localStorage
      localStorage.removeItem('uploadedAudioFile');
      localStorage.removeItem('uploadedAudioFileName');
      localStorage.removeItem('uploadedAudioFileSize');
      localStorage.removeItem('uploadedAudioFileType');
      localStorage.removeItem('uploadedAudioFileData');
      
      // Show success message and redirect
      alert(`Successfully broadcast "${metadata.episodeTitle}" to Telecast!`);
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error broadcasting podcast:', error);
      alert(`Error broadcasting podcast: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                        variant="contained"
                        onClick={handleFileSave}
                        disabled={isUploading}
                        startIcon={isUploading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        {isUploading ? 'Saving...' : 'Save File'}
                      </Button>
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
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: enabled 
                            ? `linear-gradient(135deg, ${getPlatformColor(platform)}15, ${getPlatformAccentColor(platform)}10)`
                            : 'rgba(255,255,255,0.05)',
                          border: enabled 
                            ? `2px solid ${getPlatformColor(platform)}` 
                            : '2px solid rgba(0,0,0,0.1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
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
                          {platform === 'telecast' && (
                            <Chip 
                              label="Required" 
                              size="small" 
                              color="primary" 
                              sx={{ 
                                mt: 1,
                                fontSize: { xs: '0.625rem', sm: '0.75rem' }
                              }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Main Podcast Metadata */}
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
                  Main Podcast Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Podcast Title"
                      value={metadata.title}
                      onChange={(e) => handleMainChange("title", e.target.value)}
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Author"
                      value={metadata.author}
                      onChange={(e) => handleMainChange("author", e.target.value)}
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
                      label="Podcast Description"
                      value={metadata.description}
                      onChange={(e) => handleMainChange("description", e.target.value)}
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
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Language</InputLabel>
                      <Select
                        value={metadata.language}
                        label="Language"
                        onChange={(e) => handleMainChange("language", e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                          '& .MuiSelect-select': {
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          },
                        }}
                      >
                        {LANGUAGES.map((lang) => (
                          <MenuItem key={lang.code} value={lang.code}>
                            {lang.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Category</InputLabel>
                      <Select
                        value={metadata.category}
                        label="Category"
                        onChange={(e) => handleMainChange("category", e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                          '& .MuiSelect-select': {
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          },
                        }}
                      >
                        {CATEGORIES.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                      label={
                        <Typography 
                          variant="body1" 
                          fontWeight={500}
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          Explicit Content
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Episode Metadata */}
            <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: '#ff6b35' }}>
                  Episode Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Episode Title"
                      value={metadata.episodeTitle}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, episodeTitle: e.target.value }))}
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
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Episode Number"
                      value={metadata.episodeNumber}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, episodeNumber: e.target.value }))}
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
                  <Grid item xs={12}>
                    <TextField
                      label="Episode Description"
                      value={metadata.episodeDescription}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, episodeDescription: e.target.value }))}
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
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Episode Type"
                      value={metadata.episodeType}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, episodeType: e.target.value }))}
                      fullWidth
                      select
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
                    >
                      <MenuItem value="full">Full Episode</MenuItem>
                      <MenuItem value="trailer">Trailer</MenuItem>
                      <MenuItem value="bonus">Bonus Content</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Publication Date"
                      type="date"
                      value={metadata.pubDate}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, pubDate: e.target.value }))}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
    </Box>
  );
} 