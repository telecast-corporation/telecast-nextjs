import { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Box, CircularProgress } from '@mui/material';

interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeVideoGridProps {
  searchQuery: string;
}

export default function YouTubeVideoGrid({ searchQuery }: YouTubeVideoGridProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!searchQuery) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch videos');
        }
        
        setVideos(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchQuery]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (videos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No videos found</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {videos.map((video) => (
        <Grid item xs={12} sm={6} md={4} key={video.id.videoId}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={video.snippet.thumbnails.high.url}
              alt={video.snippet.title}
              sx={{ cursor: 'pointer' }}
              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, '_blank')}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="div" noWrap>
                {video.snippet.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {video.snippet.channelTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(video.snippet.publishedAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 