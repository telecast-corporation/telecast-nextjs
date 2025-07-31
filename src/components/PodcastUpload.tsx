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
} from '@mui/material';
import { useRouter } from 'next/navigation';

const categories = [
  'Technology',
  'Business',
  'Science',
  'Health',
  'Education',
  'Entertainment',
  'Sports',
  'News',
  'Other',
];

export default function PodcastUpload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !description || !category || !audioFile || !imageFile) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('tags', tags.join(','));
      formData.append('audio', audioFile);
      formData.append('image', imageFile);

      const response = await fetch('/api/podcasts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload podcast');
      }

              router.push('/create');
      router.refresh();
    } catch (err) {
      setError('Error uploading podcast. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Upload New Podcast
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category *</InputLabel>
          <Select
            value={category}
            label="Category *"
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          placeholder="Press Enter to add tags"
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleTagDelete(tag)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Audio File *
          </Typography>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            required
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Cover Image *
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
          {loading ? <CircularProgress size={24} /> : 'Upload Podcast'}
        </Button>
      </Box>
    </Paper>
  );
} 