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
        const [video, setVideo] = useState<any[]>([]);
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
              setVideo([videoData]);

            } catch (err) {
              setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
              setLoading(false);
            }
          };

          fetchVideo();
        }, [params.id]);

        return (
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
              </Box>
            )}
            {error && (
              <Typography color="danger">{error}</Typography>
            )}
            {!loading && !error && video.length > 0 && (
                video.map((item, index) => {
                    const videoSrc = item.videoUrl.match(/src="([^\"]+)"/)?.[1];
                    return (
                        <Card key={index}>
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
                                {item.title}
                            </Typography>
                            
                            <Typography sx={{ mb: 1 }}>
                                Channel: <Link href={item.channelUrl} target="_blank" rel="noopener">{item.channelTitle}</Link>
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Chip icon={<Visibility />} label={`${item.viewCount.toLocaleString()} views`} />
                                <Chip icon={<ThumbUp />} label={`${item.likeCount.toLocaleString()} likes`} />
                                <Chip icon={<Schedule />} label={new Date(item.publishedAt).toLocaleDateString()} />
                                <Chip label={item.duration} />
                                <Chip label={item.source} color="primary" variant="outlined" />
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                {formatDescription(item.description)}
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <img src={item.thumbnail} alt={item.title} style={{ maxWidth: '100%' }} />
                            </Box>

                            <Link href={item.sourceUrl} target="_blank" rel="noopener">View on {item.source}</Link>
                            </CardContent>
                        </Card>
                    )
                })
            )}
            {!loading && !error && video.length === 0 && (
                <Typography>No video found.</Typography>
            )}
          </Container>
        );
      }