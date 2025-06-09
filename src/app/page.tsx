'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  IconButton,
  Chip
} from '@mui/material';
import { PlayArrow, Share, Close } from '@mui/icons-material';

interface TrendingContent {
  podcasts: Array<{
    id: string;
    title: string;
    description: string;
    image?: string;
    enclosureUrl: string;
    url?: string;
    author?: string;
    episodeCount?: number;
    categories?: Record<string, string>;
  }>;
  videos: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: { url: string };
      };
    };
    url?: string;
  }>;
  songs: Array<{
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      images: Array<{ url: string }>;
    };
    preview_url: string;
    url?: string;
  }>;
  books: Array<{
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      imageLinks?: {
        thumbnail: string;
      };
    };
    url?: string;
  }>;
}

export default function HomePage() {
  const [trendingContent, setTrendingContent] = useState<TrendingContent>({
    podcasts: [],
    videos: [],
    songs: [],
    books: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaDialog, setMediaDialog] = useState<{
    open: boolean;
    type: 'audio' | 'video' | 'youtube' | 'spotify' | null;
    url: string | null;
    title: string;
    loading: boolean;
    error: string | null;
    currentPodcastIndex?: number;
  }>({
    open: false,
    type: null,
    url: null,
    title: '',
    loading: false,
    error: null,
    currentPodcastIndex: undefined
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchTrendingContent = async () => {
      try {
        const response = await fetch('/api/trending');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Trending content data:', data);
        
        // Validate and process the data
        const processedData = {
          podcasts: data.podcasts?.map((podcast: any) => ({
            ...podcast,
            enclosureUrl: podcast.enclosureUrl || podcast.url || null
          })) || [],
          videos: data.videos || [],
          songs: data.songs?.map((song: any) => ({
            ...song,
            preview_url: song.preview_url || song.url || null
          })) || [],
          books: data.books || []
        };
        
        setTrendingContent(processedData);
      } catch (err) {
        console.error('Error fetching trending content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingContent();
  }, []);

  const handleMediaPlay = (type: 'audio' | 'video', url: string, title: string) => {
    setMediaDialog({
      open: true,
      type,
      url,
      title,
      loading: true,
      error: null
    });

    // If it's audio, proxy the URL through our API
    if (type === 'audio') {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      setMediaDialog(prev => ({
        ...prev,
        url: proxyUrl
      }));
    }

    // If it's audio, try to load it immediately
    if (type === 'audio' && audioRef.current) {
      audioRef.current.load();
    }
  };

  const handleCloseMedia = () => {
    setMediaDialog({
      open: false,
      type: null,
      url: null,
      title: '',
      loading: false,
      error: null
    });
  };

  const handleMediaError = () => {
    setMediaDialog(prev => ({
      ...prev,
      loading: false,
      error: 'Failed to load media. Please try again later.'
    }));
  };

  const handleMediaLoaded = () => {
    setMediaDialog(prev => ({
      ...prev,
      loading: false,
      error: null
    }));
  };

  // Helper to play a podcast by index
  const playPodcastByIndex = (index: number) => {
    if (!trendingContent || !trendingContent.podcasts) return;
    const podcast = trendingContent.podcasts[index];
    if (!podcast) return;
    const url = podcast.enclosureUrl || podcast.url;
    if (url) {
      if (url.match(/\.(mp3|m4a|wav|ogg|aac)$/i)) {
        setMediaDialog({
          open: true,
          type: 'audio',
          url: `/api/proxy?url=${encodeURIComponent(url)}`,
          title: podcast.title,
          loading: true,
          error: null,
          currentPodcastIndex: index
        });
      } else {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch podcast feed');
            return response.text();
          })
          .then(feedContent => {
            const audioUrlMatch = feedContent.match(/<enclosure[^>]+url="([^"]+)"/i);
            if (audioUrlMatch && audioUrlMatch[1]) {
              setMediaDialog({
                open: true,
                type: 'audio',
                url: `/api/proxy?url=${encodeURIComponent(audioUrlMatch[1])}`,
                title: podcast.title,
                loading: true,
                error: null,
                currentPodcastIndex: index
              });
            } else {
              throw new Error('No audio URL found in podcast feed');
            }
          })
          .catch(error => {
            setMediaDialog({
              open: true,
              type: 'audio',
              url: null,
              title: podcast.title,
              loading: false,
              error: 'Failed to load podcast. Please try again later.',
              currentPodcastIndex: index
            });
          });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Trending Content
      </Typography>

      {/* Podcasts Section */}
      {trendingContent.podcasts.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>Recent Podcasts</Typography>
          <Grid container spacing={3}>
            {trendingContent.podcasts.map((podcast) => (
              <Grid item xs={12} sm={6} md={4} key={podcast.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={podcast.image || 'https://via.placeholder.com/200'}
                    alt={podcast.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {podcast.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      By {podcast.author || 'Unknown Author'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {podcast.description}
                    </Typography>
                    {podcast.episodeCount && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {podcast.episodeCount} episodes
                      </Typography>
                    )}
                    {podcast.categories && Object.values(podcast.categories).length > 0 && (
                      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Object.values(podcast.categories).slice(0, 3).map((category: string, index) => (
                          <Chip
                            key={index}
                            label={category}
                            size="small"
                            sx={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
                          />
                        ))}
                      </Box>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        startIcon={<PlayArrow />}
                        size="small"
                        onClick={() => {
                          if (!trendingContent || !trendingContent.podcasts) return;
                          const index = trendingContent.podcasts.findIndex((p: any) => p.id === podcast.id);
                          playPodcastByIndex(index);
                        }}
                      >
                        Play
                      </Button>
                      <Button 
                        startIcon={<Share />} 
                        size="small"
                        onClick={() => {
                          const url = podcast.enclosureUrl || podcast.url;
                          if (url) {
                            navigator.clipboard.writeText(url);
                            alert('Link copied to clipboard!');
                          } else {
                            alert('No shareable content available');
                          }
                        }}
                      >
                        Share
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Videos Section */}
      {trendingContent.videos.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>Videos</Typography>
          <Grid container spacing={3}>
            {trendingContent.videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={typeof video.id === 'string' ? video.id : video.id?.videoId}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {video.snippet.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {video.snippet.description}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        startIcon={<PlayArrow />} 
                        size="small"
                        onClick={() => {
                          const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
                          if (videoId) {
                            setMediaDialog({
                              open: true,
                              type: 'youtube',
                              url: `https://www.youtube.com/embed/${videoId}`,
                              title: video.snippet.title,
                              loading: false,
                              error: null
                            });
                          } else {
                            alert('No playable content available for this video');
                          }
                        }}
                      >
                        Watch
                      </Button>
                      <Button 
                        startIcon={<Share />} 
                        size="small"
                        onClick={() => {
                          const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
                          const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
                          if (url) {
                            navigator.clipboard.writeText(url);
                            alert('Link copied to clipboard!');
                          } else {
                            alert('No shareable content available');
                          }
                        }}
                      >
                        Share
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Songs Section */}
      {trendingContent.songs.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>Songs</Typography>
          <Grid container spacing={3}>
            {trendingContent.songs.map((song) => (
              <Grid item xs={12} sm={6} md={4} key={song.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={song.album.images[0]?.url || 'https://via.placeholder.com/200'}
                    alt={song.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {song.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {song.artists.map(artist => artist.name).join(', ')}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        startIcon={<PlayArrow />}
                        size="small"
                        onClick={() => {
                          const trackId = song.id;
                          if (trackId) {
                            setMediaDialog({
                              open: true,
                              type: 'spotify',
                              url: `https://open.spotify.com/embed/track/${trackId}`,
                              title: song.name,
                              loading: false,
                              error: null
                            });
                          } else {
                            alert('No preview available for this song');
                          }
                        }}
                      >
                        Play
                      </Button>
                      <Button 
                        startIcon={<Share />} 
                        size="small"
                        onClick={() => {
                          const url = song.preview_url || song.url;
                          if (url) {
                            navigator.clipboard.writeText(url);
                            alert('Link copied to clipboard!');
                          } else {
                            alert('No shareable content available');
                          }
                        }}
                      >
                        Share
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Books Section */}
      {trendingContent.books.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>Books</Typography>
          <Grid container spacing={3}>
            {trendingContent.books.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/200'}
                    alt={book.volumeInfo.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {book.volumeInfo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        startIcon={<PlayArrow />} 
                        size="small"
                        onClick={() => {
                          const url = `https://books.google.com/books?id=${book.id}&printsec=frontcover&dq=&hl=&cd=1&source=gbs_api#v=onepage&q&f=false`;
                          if (book.id) {
                            window.open(url, '_blank');
                          } else {
                            alert('No preview available for this book');
                          }
                        }}
                      >
                        Preview
                      </Button>
                      <Button 
                        startIcon={<Share />} 
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://books.google.com/books?id=${book.id}`);
                          alert('Link copied to clipboard!');
                        }}
                      >
                        Share
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Media Player Dialog */}
      <Dialog
        open={mediaDialog.open}
        onClose={handleCloseMedia}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseMedia}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1
            }}
          >
            <Close />
          </IconButton>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {mediaDialog.title}
            </Typography>
            {mediaDialog.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {mediaDialog.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {mediaDialog.error}
              </Alert>
            )}
            {mediaDialog.type === 'audio' && mediaDialog.url && typeof mediaDialog.currentPodcastIndex === 'number' && trendingContent?.podcasts && (
              <Box sx={{ mt: 2 }}>
                <audio
                  ref={audioRef}
                  controls
                  style={{ width: '100%' }}
                  src={mediaDialog.url}
                  onError={handleMediaError}
                  onLoadedData={handleMediaLoaded}
                  preload="auto"
                >
                  Your browser does not support the audio element.
                </audio>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    disabled={mediaDialog.currentPodcastIndex === 0}
                    onClick={() => playPodcastByIndex(mediaDialog.currentPodcastIndex! - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.load();
                        audioRef.current.play().catch(error => {
                          handleMediaError();
                        });
                      }
                    }}
                  >
                    Retry Playback
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={mediaDialog.currentPodcastIndex === trendingContent.podcasts.length - 1}
                    onClick={() => playPodcastByIndex(mediaDialog.currentPodcastIndex! + 1)}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
            {mediaDialog.type === 'video' && mediaDialog.url && (
              <video
                controls
                style={{ width: '100%', maxHeight: '70vh' }}
                src={mediaDialog.url}
                onError={handleMediaError}
                onLoadedData={handleMediaLoaded}
                preload="auto"
              >
                Your browser does not support the video element.
              </video>
            )}
            {mediaDialog.type === 'youtube' && mediaDialog.url && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <iframe
                  width="100%"
                  height="400"
                  src={mediaDialog.url}
                  title={mediaDialog.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: 12 }}
                />
              </Box>
            )}
            {mediaDialog.type === 'spotify' && mediaDialog.url && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <iframe
                  src={mediaDialog.url}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Spotify Player"
                  style={{ borderRadius: 12 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
