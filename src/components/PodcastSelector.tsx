'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';

interface Podcast {
  id: string;
  title: string;
  description: string;
  coverImage: string;
}

interface PodcastSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (podcastId: string) => void;
  onCreate: (podcast: Podcast) => void;
}

export default function PodcastSelector({
  open,
  onClose,
  onSelect,
  onCreate,
}: PodcastSelectorProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPodcast, setNewPodcast] = useState({
    title: '',
    description: '',
    category: '',
    language: 'en',
    explicit: false,
    ownerName: '',
    ownerEmail: '',
    website: '',
  });

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await fetch('/api/podcast/internal');
        if (!response.ok) throw new Error('Failed to fetch podcasts');
        const data = await response.json();
        setPodcasts(data);
      } catch (error) {
        console.error('Error fetching podcasts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPodcasts();
    }
  }, [open]);

  const handleCreatePodcast = async () => {
    try {
      const response = await fetch('/api/podcast/internal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPodcast),
      });

      if (!response.ok) throw new Error('Failed to create podcast');
      const podcast = await response.json();
      onCreate(podcast);
      onClose();
    } catch (error) {
      console.error('Error creating podcast:', error);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isCreating ? 'Create New Podcast' : 'Select Podcast'}
      </DialogTitle>
      <DialogContent>
        {isCreating ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newPodcast.title}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, title: e.target.value })
              }
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newPodcast.description}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, description: e.target.value })
              }
              required
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newPodcast.category}
                label="Category"
                onChange={(e) =>
                  setNewPodcast({ ...newPodcast, category: e.target.value })
                }
                required
              >
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Health">Health</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Entertainment">Entertainment</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="News">News</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Owner Name"
              value={newPodcast.ownerName}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, ownerName: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Owner Email"
              type="email"
              value={newPodcast.ownerEmail}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, ownerEmail: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Website"
              value={newPodcast.website}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, website: e.target.value })
              }
              sx={{ mb: 2 }}
            />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {podcasts.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                You haven't created any podcasts yet.
              </Typography>
            ) : (
              podcasts.map((podcast) => (
                <Button
                  key={podcast.id}
                  fullWidth
                  variant="outlined"
                  onClick={() => onSelect(podcast.id)}
                  sx={{ mb: 1, justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  <Box>
                    <Typography variant="subtitle1">{podcast.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {podcast.description}
                    </Typography>
                  </Box>
                </Button>
              ))
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Back to Selection' : 'Create New Podcast'}
        </Button>
        {isCreating ? (
          <Button
            onClick={handleCreatePodcast}
            variant="contained"
            disabled={!newPodcast.title || !newPodcast.description || !newPodcast.category}
          >
            Create Podcast
          </Button>
        ) : (
          <Button onClick={onClose}>Cancel</Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 