'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeDown as VolumeDownIcon,
  VolumeOff as VolumeOffIcon,
  Replay10 as Replay10Icon,
  Forward30 as Forward30Icon,
} from '@mui/icons-material';

interface AudioPlayerProps {
  audioUrl: string;
  imageUrl: string;
  title: string;
  episodeTitle: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, imageUrl, title, episodeTitle }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoading = () => setIsLoading(true);
    const handleLoaded = () => setIsLoading(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleLoading);
    audio.addEventListener('playing', handleLoaded);
    audio.addEventListener('canplay', handleLoaded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleLoading);
      audio.removeEventListener('playing', handleLoaded);
      audio.removeEventListener('canplay', handleLoaded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue as number;
      setCurrentTime(newValue as number);
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      const newVolume = newValue as number;
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const seekForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 30);
    }
  };

  const seekBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, boxShadow: 3, borderRadius: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 100, height: 100, borderRadius: 1.5, mr: 2 }}
        image={imageUrl}
        alt={title}
      />
      <Box sx={{ flex: 1 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{episodeTitle}</Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <IconButton onClick={togglePlayPause} size="small">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          )}
          <Slider
            value={currentTime}
            max={duration || 0}
            onChange={handleSeek}
            aria-labelledby="time-slider"
            size="small"
            sx={{ mx: 2 }}
          />
          <Typography variant="caption">{formatTime(currentTime)} / {formatTime(duration)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <IconButton onClick={seekBackward} size="small"><Replay10Icon /></IconButton>
            <IconButton onClick={seekForward} size="small"><Forward30Icon /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={toggleMute} size="small">
              {isMuted ? <VolumeOffIcon /> : volume > 0.5 ? <VolumeUpIcon /> : <VolumeDownIcon />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              max={1}
              step={0.1}
              onChange={handleVolumeChange}
              aria-labelledby="volume-slider"
              sx={{ width: 100 }}
              size="small"
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default AudioPlayer;
