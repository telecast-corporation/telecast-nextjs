'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  IconButton,
  Slider,
  Stack,
  Paper,
  Divider,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
  Speed,
  Share,
  Timer,
  QueueMusic,
  Send,
} from '@mui/icons-material';
import { useAudio } from '@/contexts/AudioContext';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  publishedAt: string;
}

interface Podcast {
  id: string;
  title: string;
  description: string;
  author: string;
  imageUrl: string;
  episodes: Episode[];
}

export default function EpisodePage() {
  const params = useParams();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; text: string; user: string; timestamp: string }>>([]);
  const [showComments, setShowComments] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    pause,
    resume,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
  } = useAudio();

  const handleTogglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const response = await fetch(`/api/podcast/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch podcast');
        }
        const data = await response.json();
        setPodcast(data);
        const episode = data.episodes.find((ep: Episode) => ep.id === params.episodeId);
        if (episode) {
          setCurrentEpisode(episode);
        } else {
          setError('Episode not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [params.id, params.episodeId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          text: comment,
          user: 'You',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setComment('');
    }
  };

  const handleTimerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement timer functionality
    setShowTimer(false);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !podcast || !currentEpisode) {
    return (
      <Container>
        <Typography color="error">{error || 'Episode not found'}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <img
                src={podcast.imageUrl}
                alt={podcast.title}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  marginRight: 16,
                }}
              />
              <Box>
                <Typography variant="h5" gutterBottom>
                  {currentEpisode.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {podcast.title} • {podcast.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(currentEpisode.publishedAt).toLocaleDateString()} • {currentEpisode.duration}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" paragraph>
              {currentEpisode.description}
            </Typography>

            {/* Player Controls */}
            <Box sx={{ mt: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <IconButton>
                  <SkipPrevious />
                </IconButton>
                <IconButton size="large" onClick={handleTogglePlayPause}>
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton>
                  <SkipNext />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                  <Slider
                    value={currentTime}
                    max={duration}
                    onChange={(_, value) => seek(value as number)}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">
                      {formatTime(currentTime)}
                    </Typography>
                    <Typography variant="caption">
                      {formatTime(duration)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton onClick={toggleMute}>
                  {isMuted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
                <Slider
                  size="small"
                  value={volume}
                  onChange={(_, value) => setVolume(value as number)}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{ width: 100 }}
                />
                <IconButton
                  onClick={() => setPlaybackRate(playbackRate === 1 ? 1.5 : 1)}
                >
                  <Speed />
                </IconButton>
                <Typography variant="caption">
                  {playbackRate}x
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton onClick={() => setShowComments(!showComments)}>
                  <QueueMusic />
                </IconButton>
                <IconButton onClick={() => setShowQueue(!showQueue)}>
                  <QueueMusic />
                </IconButton>
                <IconButton onClick={() => setShowTimer(!showTimer)}>
                  <Timer />
                </IconButton>
                <IconButton>
                  <Share />
                </IconButton>
              </Stack>
            </Box>
          </Paper>

          {/* Comments Section */}
          {showComments && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Comments
              </Typography>
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id}>
                    <ListItemAvatar>
                      <Avatar>{comment.user[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={comment.text}
                      secondary={`${comment.user} • ${comment.timestamp}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<Send />}
                  disabled={!comment.trim()}
                >
                  Comment
                </Button>
              </Box>
            </Paper>
          )}

          {/* Queue Section */}
          {showQueue && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Queue
              </Typography>
              <List>
                {podcast.episodes.map((episode) => (
                  <ListItem
                    key={episode.id}
                    button
                    selected={episode.id === currentEpisode.id}
                  >
                    <ListItemText
                      primary={episode.title}
                      secondary={`${new Date(episode.publishedAt).toLocaleDateString()} • ${episode.duration}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Timer Section */}
          {showTimer && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sleep Timer
              </Typography>
              <Box component="form" onSubmit={handleTimerSubmit}>
                <TextField
                  type="number"
                  label="Minutes"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                  inputProps={{ min: 1, max: 120 }}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained">
                  Set Timer
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              More Episodes
            </Typography>
            <List>
              {podcast.episodes
                .filter((episode) => episode.id !== currentEpisode.id)
                .map((episode) => (
                  <ListItem
                    key={episode.id}
                    button
                    onClick={() => {
                      setCurrentEpisode(episode);
                      seek(0);
                      handleTogglePlayPause();
                    }}
                  >
                    <ListItemText
                      primary={episode.title}
                      secondary={`${new Date(episode.publishedAt).toLocaleDateString()} • ${episode.duration}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 