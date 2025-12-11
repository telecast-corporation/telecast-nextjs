
'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

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

export default function CreatePodcastPageContent() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPodcast, setNewPodcast] = useState({
    title: '',
    description: '',
    category: '',
    language: 'en',
    explicit: false,
    copyright: '',
    website: '',
    author: '',
    imageFile: null as File | null,
  });
  const [tags, setTags] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container>
        <Alert severity="error">
          You must be logged in to create a podcast. <a href="/api/auth/login">Login</a>
        </Alert>
      </Container>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPodcast((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewPodcast((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPodcast((prev) => ({
        ...prev,
        imageFile: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    Object.keys(newPodcast).forEach((key) => {
      if (key === 'imageFile' && newPodcast.imageFile) {
        formData.append('image', newPodcast.imageFile);
      } else {
        formData.append(key, (newPodcast as any)[key]);
      }
    });
    formData.append('tags', tags);
    formData.append('owner', user.sub || '');


    try {
      const response = await fetch('/api/podcast/internal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create podcast');
      }

      const data = await response.json();
      router.push(`/my-podcasts/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
        Back to My Podcasts
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Podcast
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Title"
              name="title"
              value={newPodcast.title}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={newPodcast.description}
              onChange={handleInputChange}
              required
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="Category"
              name="category"
              value={newPodcast.category}
              onChange={handleInputChange}
              select
              required
              fullWidth
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Language"
              name="language"
              value={newPodcast.language}
              onChange={handleInputChange}
              required
              fullWidth
            />
             <TextField
              label="Author"
              name="author"
              value={newPodcast.author}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Copyright"
              name="copyright"
              value={newPodcast.copyright}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Website"
              name="website"
              value={newPodcast.website}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              fullWidth
              helperText="e.g., tech, startups, programming"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="explicit"
                  checked={newPodcast.explicit}
                  onChange={handleCheckboxChange}
                />
              }
              label="Explicit Content"
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Podcast Artwork
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'block', marginTop: '8px' }}
              />
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creating...' : 'Create Podcast'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
