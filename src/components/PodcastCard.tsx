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
      const playablePodcast = {
        id: podcast.id.toString(),
        title: podcast.title,
        author: podcast.author,
        description: podcast.description,
        image: podcast.image,
        url: podcast.url,
      };
      const playableEpisode = {
        id: episode.id.toString(),
        title: episode.title,
        description: episode.description,
        audioUrl: episode.audioUrl,
        duration: episode.duration,
        publishDate: episode.publishDate,
      };
      play(playablePodcast, playableEpisode);
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
          image={podcast.image}
          alt={podcast.title}
          sx={{
            objectFit: 'cover',
            width: '100%',
            height: { xs: 120, sm: 160, md: 200 },
            maxHeight: { xs: 120, sm: 160, md: 200 },
          }}
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
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 2 } }}>
        <Typography gutterBottom variant="h6" component="div" noWrap sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
          {podcast.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }} noWrap>
          {podcast.author}
        </Typography>
        {episode && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }} noWrap>
            {episode.title}
          </Typography>
        )}
        <Box sx={{ mt: 'auto', display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {podcast.categories?.map((category) => (
            <Chip
              key={category}
              label={category}
              size="small"
              sx={{
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                height: { xs: 20, sm: 24, md: 28 },
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
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