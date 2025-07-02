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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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

const DEFAULT_METADATA = {
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
  const [metadata, setMetadata] = useState(DEFAULT_METADATA);
  const [platforms, setPlatforms] = useState({
    spotify: false,
    apple: false,
    google: false,
    telecast: true, // always true
  });

  // Autofill logic for platform fields
  const handleMainChange = (field, value) => {
    setMetadata((prev) => {
      const next = { ...prev, [field]: value };
      // Autofill platform fields if they are empty
      if (field === "title") {
        if (!prev.apple.subtitle) next.apple.subtitle = value;
        if (!prev.apple.summary) next.apple.summary = value;
      }
      if (field === "description") {
        if (!prev.apple.summary) next.apple.summary = value;
      }
      return next;
    });
  };

  const handlePlatformChange = (platform, field, value) => {
    setMetadata((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handlePlatformSelect = (platform) => {
    setPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Artwork upload handler
  const handleArtworkUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMetadata((prev) => ({ ...prev, artwork: file }));
    }
  };

  // Form submission handler (stub)
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Validate and submit metadata to backend
    alert("Broadcast submitted! (Stub)");
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 5, px: 2 }}>
      <Typography variant="h3" fontWeight={800} mb={2}>
        Broadcast Your Podcast
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={3}>
        Fill in your podcast and episode details, select platforms, and customize metadata for each platform.
      </Typography>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
        <form onSubmit={handleSubmit}>
          {/* Platform Selection */}
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Select Platforms
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={<Checkbox checked={platforms.spotify} onChange={() => handlePlatformSelect("spotify")} />}
                label="Spotify Podcast"
              />
              <FormControlLabel
                control={<Checkbox checked={platforms.apple} onChange={() => handlePlatformSelect("apple")} />}
                label="Apple Podcast"
              />
              <FormControlLabel
                control={<Checkbox checked={platforms.google} onChange={() => handlePlatformSelect("google")} />}
                label="Google Podcast"
              />
              <FormControlLabel
                control={<Checkbox checked disabled />}
                label={<b>Telecast (Required)</b>}
              />
            </FormGroup>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Main Podcast Metadata */}
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Main Podcast Metadata
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Podcast Title"
                value={metadata.title}
                onChange={(e) => handleMainChange("title", e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Author"
                value={metadata.author}
                onChange={(e) => handleMainChange("author", e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Podcast Description"
                value={metadata.description}
                onChange={(e) => handleMainChange("description", e.target.value)}
                fullWidth
                multiline
                minRows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={metadata.language}
                  label="Language"
                  onChange={(e) => handleMainChange("language", e.target.value)}
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
                sx={{ height: 56 }}
              >
                {metadata.artwork ? "Change Artwork" : "Upload Artwork"}
                <input type="file" accept="image/png, image/jpeg" hidden onChange={handleArtworkUpload} />
              </Button>
              {metadata.artwork && (
                <Box mt={1} display="flex" alignItems="center" gap={2}>
                  <Avatar src={URL.createObjectURL(metadata.artwork)} sx={{ width: 56, height: 56 }} />
                  <Typography variant="body2">{metadata.artwork.name}</Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={metadata.explicit}
                    onChange={(e) => handleMainChange("explicit", e.target.checked)}
                  />
                }
                label="Explicit Content"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Episode Metadata */}
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Episode Metadata
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Episode Title"
                value={metadata.episodeTitle}
                onChange={(e) => setMetadata((prev) => ({ ...prev, episodeTitle: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Episode Number"
                value={metadata.episodeNumber}
                onChange={(e) => setMetadata((prev) => ({ ...prev, episodeNumber: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Episode Description"
                value={metadata.episodeDescription}
                onChange={(e) => setMetadata((prev) => ({ ...prev, episodeDescription: e.target.value }))}
                fullWidth
                multiline
                minRows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Episode Type"
                value={metadata.episodeType}
                onChange={(e) => setMetadata((prev) => ({ ...prev, episodeType: e.target.value }))}
                fullWidth
                select
              >
                <MenuItem value="full">Full</MenuItem>
                <MenuItem value="trailer">Trailer</MenuItem>
                <MenuItem value="bonus">Bonus</MenuItem>
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
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Platform-Specific Metadata */}
          {platforms.apple && (
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Apple Podcasts Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="iTunes Subtitle"
                    value={metadata.apple.subtitle}
                    onChange={(e) => handlePlatformChange("apple", "subtitle", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="iTunes Summary"
                    value={metadata.apple.summary}
                    onChange={(e) => handlePlatformChange("apple", "summary", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="iTunes Keywords"
                    value={metadata.apple.keywords}
                    onChange={(e) => handlePlatformChange("apple", "keywords", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="iTunes Season"
                    value={metadata.apple.season}
                    onChange={(e) => handlePlatformChange("apple", "season", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="iTunes Category"
                    value={metadata.apple.itunesCategory}
                    onChange={(e) => handlePlatformChange("apple", "itunesCategory", e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {platforms.google && (
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Google Podcasts Metadata (legacy)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Google Play Email"
                    value={metadata.google.email}
                    onChange={(e) => handlePlatformChange("google", "email", e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Submit Button */}
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 700, px: 5, py: 1.5, borderRadius: 2 }}>
              Broadcast
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
} 