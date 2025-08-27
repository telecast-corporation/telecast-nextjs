'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

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

export default function FinalizeEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.id as string;
  const episodeId = params.episodeId as string;
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState<number | ''>('');
  const [seasonNumber, setSeasonNumber] = useState<number | ''>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [explicit, setExplicit] = useState(false);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/podcast/internal/${podcastId}/episode/${episodeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch episode');
        }
        
        const episodeData = await response.json();
        setEpisode(episodeData);
        
        // Pre-fill form with existing data
        setTitle(episodeData.title || '');
        setDescription(episodeData.description || '');
        setEpisodeNumber(episodeData.episodeNumber || '');
        setSeasonNumber(episodeData.seasonNumber || '');
        setKeywords(episodeData.keywords || []);
        setExplicit(episodeData.explicit || false);
        
      } catch (error) {
        console.error('Error fetching episode:', error);
        setError('Failed to load episode');
      } finally {
        setLoading(false);
      }
    };

    if (podcastId && episodeId) {
      fetchEpisode();
    }
  }, [podcastId, episodeId]);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: title.trim() || null,
        description: description.trim() || null,
        episodeNumber: episodeNumber ? Number(episodeNumber) : null,
        seasonNumber: seasonNumber ? Number(seasonNumber) : null,
        keywords,
        explicit,
        isFinal: true,
      };

      const response = await fetch(`/api/podcast/internal/${podcastId}/episode/${episodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update episode');
      }

      // Navigate back to podcast page
      router.push(`/podcast/${podcastId}`);
      
    } catch (error) {
      console.error('Error saving episode:', error);
      setError('Failed to save episode');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: title.trim() || null,
        description: description.trim() || null,
        episodeNumber: episodeNumber ? Number(episodeNumber) : null,
        seasonNumber: seasonNumber ? Number(seasonNumber) : null,
        keywords,
        explicit,
        isFinal: true,
        isPublished: true,
      };

      const response = await fetch(`/api/podcast/internal/${podcastId}/episode/${episodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

             if (!response.ok) {
         throw new Error('Failed to publish episode');
       }

       // Navigate to distribute page
       router.push(`/podcast/${podcastId}/episode/${episodeId}/distribute`);
      
    } catch (error) {
      console.error('Error publishing episode:', error);
      setError('Failed to publish episode');
    } finally {
      setSaving(false);
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
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/podcast/${podcastId}`)}
        >
          Back to Podcast
        </Button>
        <Typography variant="h4" component="h1">
          Finalize Episode
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Episode Information
        </Typography>
        
        <Stack spacing={3}>
          <TextField
            label="Episode Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            helperText="Enter a descriptive title for your episode"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            helperText="Provide a detailed description of your episode"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Episode Number"
              type="number"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value ? Number(e.target.value) : '')}
              sx={{ flex: 1 }}
              helperText="Optional episode number"
            />

            <TextField
              label="Season Number"
              type="number"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(e.target.value ? Number(e.target.value) : '')}
              sx={{ flex: 1 }}
              helperText="Optional season number"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Keywords
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="Add keyword"
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {keywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onDelete={() => handleRemoveKeyword(keyword)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Explicit Content</InputLabel>
            <Select
              value={explicit.toString()}
              onChange={(e) => setExplicit(e.target.value === 'true')}
              label="Explicit Content"
            >
              <MenuItem value="false">No (Clean)</MenuItem>
              <MenuItem value="true">Yes (Explicit)</MenuItem>
            </Select>
          </FormControl>

          {episode.fileSize && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Audio File:</strong> {(episode.fileSize / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/podcast/${podcastId}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving || !title.trim()}
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handlePublish}
              disabled={saving || !title.trim()}
            >
              {saving ? 'Publishing...' : 'Publish Episode'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
} 