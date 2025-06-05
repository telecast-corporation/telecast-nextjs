'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PodcastSelector from './PodcastSelector';

export default function EpisodeUpload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPodcastSelector, setShowPodcastSelector] = useState(true);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState<number | ''>('');
  const [seasonNumber, setSeasonNumber] = useState<number | ''>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [explicit, setExplicit] = useState(false);
  const [error, setError] = useState('');

  const handleKeywordInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const handleKeywordDelete = (keywordToDelete: string) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToDelete));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedPodcastId || !title || !description || !audioFile) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('podcastId', selectedPodcastId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('episodeNumber', episodeNumber.toString());
      formData.append('seasonNumber', seasonNumber.toString());
      formData.append('keywords', keywords.join(','));
      formData.append('audio', audioFile);
      formData.append('explicit', explicit.toString());

      const response = await fetch('/api/episodes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload episode');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Error uploading episode. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PodcastSelector
        open={showPodcastSelector}
        onClose={() => setShowPodcastSelector(false)}
        onSelect={(podcastId) => {
          setSelectedPodcastId(podcastId);
          setShowPodcastSelector(false);
        }}
        onCreate={(podcast) => {
          setSelectedPodcastId(podcast.id);
          setShowPodcastSelector(false);
        }}
      />

      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload New Episode
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Episode Number"
              type="number"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value ? parseInt(e.target.value) : '')}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Season Number"
              type="number"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(e.target.value ? parseInt(e.target.value) : '')}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            fullWidth
            label="Keywords"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordInputKeyDown}
            placeholder="Press Enter to add keywords"
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            {keywords.map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                onDelete={() => handleKeywordDelete(keyword)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={explicit}
                onChange={(e) => setExplicit(e.target.checked)}
              />
            }
            label="Explicit Content"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Audio File
            </Typography>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              required
            />
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload Episode'}
          </Button>
        </Box>
      </Paper>
    </>
  );
} 