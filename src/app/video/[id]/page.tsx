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
          thumbnail: string;
          channelTitle: string;
          channelUrl: string;
          publishedAt: string;
          viewCount: number;
          likeCount: number;
          duration: string;
          source: string;
          videoUrl: string;
          sourceUrl: string;
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
          const videoData = {
            "id": "l4jwBzDLlpA",
            "title": "ZINERA - RITZ CARLTON  (Official Video)",
            "description": "Retrouvez moi partout sur : https://linktr.ee/Zinera06\n\nSnapchat ► https://www.snapchat.com/@fast_life06\n\nInstagram ► https://www.instagram.com/zinera_06/ \n\n__________\n \n⁠⁠ \nFilmé et édité par ► @spongeproductions  ⁠⁠ \nMixed by  ►  https://www.instagram.com/qu4tro_beats/\n\n#fastlife  #montreal 🇩🇿🇨🇦",
            "thumbnail": "https://i.ytimg.com/vi/l4jwBzDLlpA/hqdefault.jpg",
            "channelTitle": "Zinera Off",
            "channelUrl": "https://www.youtube.com/channel/UCmxjY7JsA-uHoAumSn068OA",
            "publishedAt": "2025-12-19T22:59:52Z",
            "viewCount": 72286,
            "likeCount": 3013,
            "duration": "4:17",
            "source": "youtube",
            "videoUrl": "<iframe width=\"100%\" height=\"100%\" src=\"//www.youtube.com/embed/l4jwBzDLlpA\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
            "sourceUrl": "https://www.youtube.com/watch?v=l4jwBzDLlpA"
          }
          setVideo(videoData);
          setLoading(false);
        }, []);

        // useEffect(() => {
        //   const fetchVideo = async () => {
        //     if (!params.id) return;
        //     try {
        //       setLoading(true);
        //       const response = await fetch(`/api/video/${params.id}`);
        //       if (!response.ok) {
        //         throw new Error('Failed to fetch video');
        //       }
        //       const { video: videoData } = await response.json();
        //       console.log('Received video data:', videoData);
        //       try {
        //         setVideo(videoData);
        //       } catch (e) {
        //         console.error('Error was thrown directly from setVideo:', e);
        //         setError('Failed to update video state.');
        //       }
        //     } catch (err) {
        //       console.error('Error during fetch or render:', err);
        //       setError(err instanceof Error ? err.message : 'An unknown error occurred');
        //     } finally {
        //       setLoading(false);
        //     }
        //   };

        //   fetchVideo();
        // }, [params.id]);

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
      