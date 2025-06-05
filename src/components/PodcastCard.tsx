'use client';

import { memo, useCallback } from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useAudio } from '@/contexts/AudioContext';
import { Podcast, Episode } from '@/lib/podcast-index';

interface PodcastCardProps {
  podcast: Podcast;
  episode?: Episode;
}

const PodcastCard = memo(({ podcast, episode }: PodcastCardProps) => {
  const { play } = useAudio();

  const handlePlay = useCallback(() => {
    if (episode) {
      play(podcast, episode);
    }
  }, [podcast, episode, play]);

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        '&:hover': {
          '& .play-button': {
            opacity: 1,
          }
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={podcast.image}
          alt={podcast.title}
          sx={{ objectFit: 'cover' }}
        />
        <IconButton
          className="play-button"
          onClick={handlePlay}
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
        >
          <PlayArrowIcon />
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {podcast.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
          {podcast.author}
        </Typography>
        {episode && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
            {episode.title}
          </Typography>
        )}
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {podcast.categories?.map((category) => (
            <Chip
              key={category}
              label={category}
              size="small"
              sx={{ 
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.main',
                }
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

PodcastCard.displayName = 'PodcastCard';

export default PodcastCard; 