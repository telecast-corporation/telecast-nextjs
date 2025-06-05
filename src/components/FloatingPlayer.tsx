'use client';

import React, { memo, useCallback } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Slider,
  Stack,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
  Speed,
} from '@mui/icons-material';
import { useAudio } from '@/contexts/AudioContext';

const FloatingPlayer = memo(() => {
  const theme = useTheme();
  const {
    currentPodcast,
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    play,
    pause,
    resume,
    seek,
    setVolume,
    setPlaybackRate,
    toggleMute,
  } = useAudio();

  // Memoize callbacks to prevent child re-renders
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const handleSeek = useCallback((_event: Event, newValue: number | number[]) => {
    seek(newValue as number);
  }, [seek]);

  const handleVolumeChange = useCallback((_event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  }, [setVolume]);

  const handlePlaybackRateChange = useCallback(() => {
    const rates = [0.5, 1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  }, [playbackRate, setPlaybackRate]);

  // Early return if no episode is playing
  if (!currentEpisode || !currentPodcast) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        p: 2,
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="subtitle1" noWrap>
            {currentEpisode.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {currentPodcast.title}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handlePlayPause}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton>
            <SkipPrevious />
          </IconButton>
          <IconButton>
            <SkipNext />
          </IconButton>
        </Stack>

        <Box sx={{ flexGrow: 1 }}>
          <Slider
            value={currentTime}
            max={duration}
            onChange={handleSeek}
            sx={{ color: theme.palette.primary.main }}
          />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption">
              {formatTime(duration)}
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={toggleMute}>
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.1}
            onChange={handleVolumeChange}
            sx={{ width: 100, color: theme.palette.primary.main }}
          />
          <IconButton onClick={handlePlaybackRateChange}>
            <Speed />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {playbackRate}x
            </Typography>
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
});

export default FloatingPlayer; 