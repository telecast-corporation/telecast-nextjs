'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayIcon, Pause as PauseIcon } from '@mui/icons-material';

interface TrendingItem {
  id: string;
  type: 'video' | 'music' | 'book' | 'podcast' | 'news' | 'tv';
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  views?: string;
  publishedAt?: string;
  artist?: string;
  album?: string;
  author?: string;
  publishedDate?: string;
  rating?: number;
  episodeCount?: number;
  categories?: string[];
  source?: string;
  sourceUrl?: string;
  year?: string;
  duration?: string;
  previewVideo?: string;
}

interface TVPreviewModalProps {
  open: boolean;
  onClose: () => void;
  tvShow: TrendingItem | null;
}

export default function TVPreviewModal({ open, onClose, tvShow }: TVPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open && videoRef.current) {
      // Reset video state when modal opens
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      // Auto-hide controls after 3 seconds
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [open, isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoClick = () => {
    handlePlayPause();
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Set new timeout to hide controls
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Set new timeout to hide controls
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleWatchFullShow = () => {
    if (tvShow?.url) {
      window.open(tvShow.url, '_blank');
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!tvShow) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        backgroundColor: '#000',
        color: '#fff',
      }}>
        <Typography variant="h6" component="div" sx={{ color: '#fff' }}>
          {tvShow.title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: '#fff' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, backgroundColor: '#000' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '400px',
            backgroundColor: '#000',
            cursor: 'pointer',
            '&:hover .video-controls': {
              opacity: 1,
            },
          }}
          onMouseMove={handleMouseMove}
        >
          <video
            ref={videoRef}
            src={tvShow.previewVideo}
            poster={tvShow.thumbnail || undefined}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onClick={handleVideoClick}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
          
          {/* Video Controls Overlay */}
          <Box
            className="video-controls"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              opacity: showControls ? 1 : 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
            }}
          >
            <IconButton
              onClick={handlePlayPause}
              sx={{
                color: '#fff',
                fontSize: '4rem',
                pointerEvents: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {isPlaying ? <PauseIcon fontSize="inherit" /> : <PlayIcon fontSize="inherit" />}
            </IconButton>
          </Box>
          
          {/* Progress Bar */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: '100%',
                backgroundColor: 'transparent',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#ff0000',
                },
              }}
            />
          </Box>
          
          {/* Time Display */}
          {showControls && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '4px 8px',
                borderRadius: 1,
                fontSize: '0.75rem',
                color: '#fff',
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Box>
          )}
        </Box>
        
        {/* Show Info */}
        <Box sx={{ p: 3, backgroundColor: '#000' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {tvShow.year && (
              <Chip
                label={tvShow.year}
                size="small"
                sx={{ backgroundColor: '#333', color: '#fff' }}
              />
            )}
            {tvShow.rating && (
              <Chip
                label={typeof tvShow.rating === 'number' ? tvShow.rating.toFixed(1) : tvShow.rating}
                size="small"
                sx={{ backgroundColor: '#333', color: '#fff' }}
              />
            )}
            {tvShow.source && (
              <Chip
                label={tvShow.source}
                size="small"
                sx={{ backgroundColor: '#ff6b35', color: '#fff' }}
              />
            )}
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3, color: '#fff', lineHeight: 1.6 }}>
            {tvShow.description || 'No description available'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleWatchFullShow}
              sx={{
                backgroundColor: '#ff6b35',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#e55a2b',
                },
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Watch Full Show on {tvShow.source}
            </Button>
            
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderColor: '#666',
                color: '#fff',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                px: 4,
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              Close Preview
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
