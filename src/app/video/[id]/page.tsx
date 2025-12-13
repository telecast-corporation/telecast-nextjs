
'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  AspectRatio,
} from '@mui/material';

interface Video {
    id: string;
    title: string;
    description: string;
    videoUrl: string; // This will be an iframe string
    channelTitle: string;
    publishedAt: string;
}

export default function VideoPlayerPage() {
  const params = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoId = params.id as string;
        
        const response = await fetch(`/api/video/${videoId}`);
        
        if (response.ok) {
          const data = await response.json();
          setVideo(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Video not found');
        }
      } catch (err) {
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !video) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography level="h4" color="danger">
          {error || 'Video not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Typography level="h4" component="h1" gutterBottom>
            {video.title}
          </Typography>
        </CardContent>
        <AspectRatio ratio="16/9">
           <div dangerouslySetInnerHTML={{ __html: video.videoUrl }} />
        </AspectRatio>
        <CardContent>
          <Typography sx={{ mt: 2 }}>
            {video.description}
          </Typography>
          <Typography level="body-sm" sx={{ mt: 2 }}>
            {video.channelTitle}
          </Typography>
          <Typography level="body-xs" sx={{ mt: 1 }}>
            {new Date(video.publishedAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
