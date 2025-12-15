'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { AspectRatio, Typography } from '@mui/joy';
import { Visibility, ThumbUp } from '@mui/icons-material';

interface Video {
    id: string;
    title: string;
    description: string;
    videoUrl: string; 
    channelTitle: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
}

export default function VideoPlayerPage() {
  const params = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        setError(null);
        const videoId = params.id as string;
        
        const response = await fetch(`/api/video/${videoId}`);
        
        if (response.ok) {
          const data = await response.json();
          setVideo(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'We could not find the video you are looking for.');
        }
      } catch (err) {
        setError('An unexpected error occurred while loading the video. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [params.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !video) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
         <Typography level="h2" color="danger" sx={{ mb: 2 }}>
            Something went wrong!
        </Typography>
        <Typography level="h4">
          {error || 'Video not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Typography level="h4" component="h1" sx={{ mb: 2 }}>
            {video.title}
          </Typography>
        </CardContent>
        <AspectRatio ratio="16/9">
           <div dangerouslySetInnerHTML={{ __html: video.videoUrl }} />
        </AspectRatio>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography level="body-sm">
                    {video.channelTitle}
                </Typography>
                {video.publishedAt && (
                    <Typography level="body-xs">
                        {new Date(video.publishedAt).toLocaleDateString()}
                    </Typography>
                )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Chip icon={<Visibility />} label={`${video.viewCount.toLocaleString()} views`} variant="outlined" />
                <Chip icon={<ThumbUp />} label={`${video.likeCount.toLocaleString()} likes`} variant="outlined" />
            </Box>
          <Typography sx={{ mt: 2 }}>
            {video.description}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
