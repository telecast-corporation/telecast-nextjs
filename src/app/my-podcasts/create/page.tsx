'use client';

import { Suspense, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
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

function CreatePodcastPageContent() {
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
    router.push('/auth/login');
    return null;
  }

  const handleCreatePodcast = async () => {
    if (!newPodcast.title || !newPodcast.description || !newPodcast.category || !newPodcast.author) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', newPodcast.title);
      formData.append('description', newPodcast.description);
      formData.append('category', newPodcast.category);
      formData.append('language', newPodcast.language);
      formData.append('explicit', newPodcast.explicit.toString());
      formData.append('copyright', newPodcast.copyright);
      formData.append('website', newPodcast.website);
      formData.append('author', newPodcast.author);
      formData.append('tags', tags);
      if (newPodcast.imageFile) {
        formData.append('imageFile', newPodcast.imageFile);
      }

      const response = await fetch('/api/podcast/internal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create podcast');
      }

      const result = await response.json();
      
      // Navigate back to my-podcasts page and refresh
      router.push('/my-podcasts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create podcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/my-podcasts')}
          sx={{ mb: 2 }}
        >
          Back to My Podcasts
        </Button>
        <Typography variant="h3">
          Create New Podcast
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set up your new podcast with basic information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          * indicates required fields
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Podcast Title"
            fullWidth
            value={newPodcast.title}
            onChange={(e) => setNewPodcast({ ...newPodcast, title: e.target.value })}
            required
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newPodcast.description}
            onChange={(e) => setNewPodcast({ ...newPodcast, description: e.target.value })}
            required
            helperText="Describe what your podcast is about"
          />

          <TextField
            select
            label="Category"
            fullWidth
            value={newPodcast.category}
            onChange={(e) => setNewPodcast({ ...newPodcast, category: e.target.value })}
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Language"
            fullWidth
            value={newPodcast.language}
            onChange={(e) => setNewPodcast({ ...newPodcast, language: e.target.value })}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="de">German</MenuItem>
            <MenuItem value="it">Italian</MenuItem>
            <MenuItem value="pt">Portuguese</MenuItem>
            <MenuItem value="ja">Japanese</MenuItem>
            <MenuItem value="ko">Korean</MenuItem>
            <MenuItem value="zh">Chinese</MenuItem>
            <MenuItem value="ru">Russian</MenuItem>
          </TextField>

          <TextField
            label="Author"
            fullWidth
            value={newPodcast.author}
            onChange={(e) => setNewPodcast({ ...newPodcast, author: e.target.value })}
            required
            helperText="The author or creator of this podcast"
          />

          <TextField
            label="Website"
            fullWidth
            value={newPodcast.website}
            onChange={(e) => setNewPodcast({ ...newPodcast, website: e.target.value })}
            placeholder="https://example.com"
            helperText="Optional website for your podcast"
          />

          <TextField
            label="Copyright"
            fullWidth
            value={newPodcast.copyright}
            onChange={(e) => setNewPodcast({ ...newPodcast, copyright: e.target.value })}
            placeholder="© 2024 Your Name"
            helperText="Copyright information for your podcast"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={newPodcast.explicit}
                onChange={(e) => setNewPodcast({ ...newPodcast, explicit: e.target.checked })}
              />
            }
            label="Explicit Content"
          />

          <TextField
            label="Tags"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas"
            helperText="Add tags separated by commas to help people discover your podcast"
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Cover Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 1 }}
            >
              Upload Cover Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setNewPodcast({
                  ...newPodcast,
                  imageFile: e.target.files?.[0] || null,
                })}
              />
            </Button>
            {newPodcast.imageFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {newPodcast.imageFile.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/my-podcasts')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreatePodcast}
              disabled={loading || !newPodcast.title || !newPodcast.description || !newPodcast.category || !newPodcast.author}
              sx={{
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' },
                minWidth: 120,
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Podcast'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default function CreatePodcastPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    }>
      <CreatePodcastPageContent />
    </Suspense>
  );
}
