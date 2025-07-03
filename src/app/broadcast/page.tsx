"use client";

import { useState } from "react";
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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useTheme } from "@mui/material/styles";
import {
  Podcasts as PodcastsIcon,
  Radio as RadioIcon,
  MusicNote as MusicNoteIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

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
  artwork: File | null;
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
  artwork: null,
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

  // Artwork upload handler
  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMetadata((prev) => ({ ...prev, artwork: file }));
    }
  };

  // Form submission handler (stub)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Validate and submit metadata to backend
    alert("Broadcast submitted! (Stub)");
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
        {/* Header Section */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h2" 
            fontWeight={900} 
            mb={2}
            sx={{
              color: theme.palette.primary.main,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
            }}
          >
            Broadcast Your Podcast
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            mb={3}
            sx={{ fontWeight: 400, maxWidth: 600, mx: 'auto' }}
          >
            Share your voice with the world across all major podcast platforms
          </Typography>
          
          {/* Platform Stats */}
          <Box display="flex" justifyContent="center" gap={3} flexWrap="wrap">
            <Chip 
              icon={<CheckCircleIcon />} 
              label="100+ Countries" 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
              }} 
            />
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Millions of Listeners" 
              sx={{ 
                bgcolor: '#ff6b35',
                color: 'white',
                fontWeight: 600,
              }} 
            />
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Instant Distribution" 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
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
            {/* Platform Selection */}
            <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: '#ff6b35' }}>
                  Select Distribution Platforms
                </Typography>
                <Grid container spacing={2}>
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
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Box
                            sx={{
                              color: enabled ? getPlatformColor(platform) : 'text.secondary',
                              mb: 1,
                              fontSize: '2rem'
                            }}
                          >
                            {getPlatformIcon(platform)}
                          </Box>
                          <Typography variant="h6" fontWeight={600} mb={1}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {platform === 'telecast' ? 'Always included' : enabled ? 'Selected' : 'Click to add'}
                          </Typography>
                          {platform === 'telecast' && (
                            <Chip 
                              label="Required" 
                              size="small" 
                              color="primary" 
                              sx={{ mt: 1 }}
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
                <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: '#ff6b35' }}>
                  Main Podcast Information
                </Typography>
                <Grid container spacing={3}>
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
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
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
                      <InputLabel>Category</InputLabel>
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
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ 
                        height: 56,
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }
                      }}
                    >
                      {metadata.artwork ? "Change Artwork" : "Upload Artwork"}
                      <input type="file" accept="image/png, image/jpeg" hidden onChange={handleArtworkUpload} />
                    </Button>
                    {metadata.artwork && (
                      <Box mt={2} display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          src={URL.createObjectURL(metadata.artwork)} 
                          sx={{ width: 64, height: 64, border: '3px solid rgba(255,255,255,0.2)' }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          {metadata.artwork.name}
                        </Typography>
                      </Box>
                    )}
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
                        <Typography variant="body1" fontWeight={500}>
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
            <Box mt={6} display="flex" justifyContent="center">
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                sx={{ 
                  fontWeight: 700, 
                  px: 6, 
                  py: 2, 
                  borderRadius: 3,
                  fontSize: '1.2rem',
                  background: theme.palette.primary.main,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  '&:hover': {
                    background: theme.palette.primary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
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