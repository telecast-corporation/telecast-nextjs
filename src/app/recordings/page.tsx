'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Button,
  Chip,
  Grid,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Timer as TimerIcon,
  Visibility as ViewIcon,
  Favorite as LikeIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface Recording {
  id: string;
  title: string;
  description: string | null;
  audioUrl: string;
  duration: number;
  tags: string[];
  isPublic: boolean;
  views: number;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function RecordingsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState<Recording | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
      router.push('/login');
      } else {
      fetchRecordings();
      }
    }
  }, [isLoading, user, router, page, filter]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filter === 'public' && { public: 'true' }),
        ...(filter === 'private' && { public: 'false' }),
      });

      const response = await fetch(`/api/recordings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }

      const data = await response.json();
      setRecordings(data.recordings);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError('Failed to load recordings');
      console.error('Fetch recordings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (recording: Recording) => {
    if (currentPlaying === recording.id) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying(recording.id);
    }
  };

  const handleEdit = (recording: Recording) => {
    router.push(`/recordings/${recording.id}/edit`);
  };

  const handleDelete = (recording: Recording) => {
    setRecordingToDelete(recording);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!recordingToDelete) return;

    try {
      const response = await fetch(`/api/recordings/${recordingToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recording');
      }

      setRecordings(prev => prev.filter(r => r.id !== recordingToDelete.id));
      setShowDeleteDialog(false);
      setRecordingToDelete(null);
    } catch (err) {
      setError('Failed to delete recording');
      console.error('Delete error:', err);
    }
  };

  const handleDownload = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.audioUrl;
    link.download = `${recording.title}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecordings = recordings.filter(recording =>
    recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3">
          My Recordings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/record')}
        >
          New Recording
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search recordings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Recordings</MenuItem>
                <MenuItem value="public">Public Only</MenuItem>
                <MenuItem value="private">Private Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Recordings Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : filteredRecordings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recordings found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Start recording to see your audio here'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/record')}
            >
              Create Your First Recording
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredRecordings.map((recording) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recording.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" noWrap sx={{ flex: 1, mr: 1 }}>
                        {recording.title}
                      </Typography>
                      <Chip
                        label={recording.isPublic ? 'Public' : 'Private'}
                        size="small"
                        color={recording.isPublic ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>

                    {recording.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {recording.description}
                      </Typography>
                    )}

                    {/* Tags */}
                    {recording.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                        {recording.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {recording.tags.length > 3 && (
                          <Chip
                            label={`+${recording.tags.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>
                    )}

                    {/* Stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimerIcon fontSize="small" />
                        <Typography variant="caption">
                          {formatTime(recording.duration)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ViewIcon fontSize="small" />
                        <Typography variant="caption">
                          {recording.views}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LikeIcon fontSize="small" />
                        <Typography variant="caption">
                          {recording.likes}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                      {formatDate(recording.createdAt)}
                    </Typography>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                      <IconButton
                        size="small"
                        onClick={() => handlePlay(recording)}
                        color={currentPlaying === recording.id ? 'primary' : 'default'}
                      >
                        {currentPlaying === recording.id ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(recording)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(recording)}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(recording)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Recording</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{recordingToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
