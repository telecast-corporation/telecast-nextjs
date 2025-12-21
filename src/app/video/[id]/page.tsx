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
        const [video, setVideo] = useState<any | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
          const fetchVideo = async () => {
            if (!params.id) return;
            try {
              setLoading(true);
              const response = await fetch(`/api/video/${params.id}`);
              if (!response.ok) {
                throw new Error('Failed to fetch video');
              }
              const { video: videoData } = await response.json();
              setVideo(videoData);

            } catch (err) {
              setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
              setLoading(false);
            }
          };

          fetchVideo();
        }, [params.id]);

        if (loading) {
          return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
            </Container>
          );
        }

        if (error) {
          return (
            <Container>
              <Typography color="danger">{error}</Typography>
            </Container>
          );
        }

        if (!video) {
          return (
            <Container>
              <Typography>No video found.</Typography>
            </Container>
          );
        }

        const videoSrc = video.videoUrl.match(/src="([^"]+)"/)?.[1];

        return (
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Card>
              <AspectRatio ratio="16/9">
                {videoSrc ? (
                  <Box
                      component="iframe"
                      src={videoSrc}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      sx={{ border: 'none', width: '100%', height: '100%' }}
                  />
                ) : (
                  <Typography>Invalid video URL</Typography>
                )}
              </AspectRatio>
              <CardContent>
                <Typography level="h1" sx={{ mb: 2 }}>
                  {video.title}
                </Typography>
                
                <Typography sx={{ mb: 1 }}>
                  Channel: <Link href={video.channelUrl} target="_blank" rel="noopener">{video.channelTitle}</Link>
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip icon={<Visibility />} label={`${video.viewCount.toLocaleString()} views`} />
                  <Chip icon={<ThumbUp />} label={`${video.likeCount.toLocaleString()} likes`} />
                  <Chip icon={<Schedule />} label={new Date(video.publishedAt).toLocaleDateString()} />
                  <Chip label={video.duration} />
                  <Chip label={video.source} color="primary" variant="outlined" />
                </Box>

                <Box sx={{ mt: 2 }}>
                  {formatDescription(video.description)}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <img src={video.thumbnail} alt={video.title} style={{ maxWidth: '100%' }} />
                </Box>

                <Link href={video.sourceUrl} target="_blank" rel="noopener">View on {video.source}</Link>
              </CardContent>
            </Card>
          </Container>
        );
      }
      