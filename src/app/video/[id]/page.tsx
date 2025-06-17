'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  Chip,
  Link,
  Divider,
  CircularProgress,
  Paper,
  Avatar,
  Button,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Speed,
  ThumbUp,
  ThumbDown,
  Share,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { useAudio } from '@/contexts/AudioContext';
import axios from 'axios';

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  duration: string;
  source: 'youtube';
  sourceUrl: string;
}

interface RelatedVideo {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  viewCount: number;
  publishedAt: string;
}

export default function VideoPage() {
  const params = useParams();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await axios.get(`/api/video/${params.id}`);
        setVideo(response.data);
        
        // Fetch related videos
        const relatedResponse = await axios.get(`/api/video/${params.id}/related`);
        setRelatedVideos(relatedResponse.data);
      } catch (err) {
        setError('Failed to load video');
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !video) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">{error || 'Video not found'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Video Player */}
          <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', mb: 3 }}>
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>

          {/* Video Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h1" gutterBottom>
                {video.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  {video.viewCount.toLocaleString()} views
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>{video.author[0]}</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">{video.author}</Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {video.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Related Videos */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Related Videos
          </Typography>
          {relatedVideos.map((relatedVideo) => (
            <Card key={relatedVideo.id} sx={{ mb: 2, display: 'flex' }}>
              <CardMedia
                component="img"
                image={relatedVideo.thumbnail}
                alt={relatedVideo.title}
                sx={{ width: 168, height: 94 }}
              />
              <CardContent sx={{ flex: 1, p: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {relatedVideo.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {relatedVideo.author}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {relatedVideo.viewCount.toLocaleString()} views •{' '}
                  {new Date(relatedVideo.publishedAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
} 