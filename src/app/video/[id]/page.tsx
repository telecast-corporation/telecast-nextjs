'use client';
import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Link,
} from '@mui/material';
import { AspectRatio, Typography } from '@mui/joy';
import { Visibility, ThumbUp, Schedule } from '@mui/icons-material';
import { useParams } from 'next/navigation';

interface Video {
    id: string;
    title: string;
    description: string;
    videoUrl: string; 
    channelTitle: string;
    channelUrl: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    duration: string;
}

// Helper to format the description
const formatDescription = (description: string) => {
    if (!description) return null;
    return description.split('\n').map((line, index) => (
        <Typography key={index} sx={{ mt: 1 }}>
            {line}
        </Typography>
    ));
};

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

  if (error) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
         <Typography level="h2" sx={{ mb: 2, color: '#ff6b35' }}>
            Something went wrong!
        </Typography>
        <Typography level="h4">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!video) {
    return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Typography level="h4">
                Video not found.
            </Typography>
        </Container>
    );
  }


  return (
    <Container sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ mb: 4, maxWidth: 900, mx: 'auto', borderRadius: 'lg' }}>
        {typeof video.videoUrl === 'string' && video.videoUrl.includes('<iframe') ? (
            <AspectRatio ratio="16/9">
               <div dangerouslySetInnerHTML={{ __html: video.videoUrl }} />
            </AspectRatio>
        ) : (
            <Box sx={{ 
              aspectRatio: '16 / 9',
              background: '#000', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
            }}>
              <Typography sx={{ color: 'white' }}>{video.title ?? 'Video preview not available'}</Typography>
            </Box>
        )}
        <CardContent sx={{ p: 3 }}>
          <Typography level="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            {video.title ?? 'Untitled Video'}
          </Typography>
          
          {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {video.channelUrl ? (
                <Link href={video.channelUrl} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline'} }}>
                  <Typography level="body-lg" sx={{ fontWeight: 'md'}}>
                      {video.channelTitle ?? 'Unknown Channel'}
                  </Typography>
                </Link>
              ) : (
                <Typography level="body-lg" sx={{ fontWeight: 'md'}}>
                    {video.channelTitle ?? 'Unknown Channel'}
                </Typography>
              )}
              {video.publishedAt && (
                  <Typography level="body-sm" sx={{ color: 'text.secondary'}}>
                      Published on {new Date(video.publishedAt).toLocaleDateString()}
                  </Typography>
              )}
          </Box> */}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
              <Chip icon={<Visibility />} label={`${(video.viewCount ?? 0).toLocaleString()} views`} variant="outlined" />
              <Chip icon={<ThumbUp />} label={`${(video.likeCount ?? 0).toLocaleString()} likes`} variant="outlined" />
              {video.duration && <Chip icon={<Schedule />} label={video.duration} variant="outlined" />}
          </Box>

          {video.description && (
            <Box sx={{ mt: 3, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
              {formatDescription(video.description)}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
