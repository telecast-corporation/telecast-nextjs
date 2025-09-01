'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Snackbar,
  Button,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Search as SearchIcon, Headphones as HeadphonesIcon, VideoLibrary as VideoIcon, MusicNote as MusicIcon, MenuBook as BookIcon, Mic as MicIcon } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import StarIcon from '@mui/icons-material/Star';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';
import PartnerLogos from '@/components/PartnerLogos';

interface TrendingItem {
    id: string;
  type: 'video' | 'music' | 'book' | 'podcast' | 'news';
    title: string;
    description: string;
  thumbnail: string;
  url: string;
  views?: string;
  publishedAt?: string;
  artist?: string;
  album?: string;
    author?: string;
  publishedDate?: string;
  rating?: number;
    episodeCount?: number;
  categories?: string[];
  source?: string;
  sourceUrl?: string;
}

interface ContentCarouselProps {
      title: string;
  items: TrendingItem[];
  onItemClick: (item: TrendingItem) => void;
}

function ContentCarousel({ title, items, onItemClick }: ContentCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const itemsPerPage = isSmallScreen ? 1 : 3;

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(items.length - itemsPerPage, prev + itemsPerPage));
  };

  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box sx={{ mb: { xs: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' } }}>
          {title}
        </Typography>
        <Box>
          <IconButton 
            onClick={handlePrev} 
            disabled={startIndex === 0}
            size="small"
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton 
            onClick={handleNext} 
            disabled={startIndex + itemsPerPage >= items.length}
            size="small"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Box>
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {visibleItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out',
                  boxShadow: 3,
                },
              }}
              onClick={() => onItemClick(item)}
            >
              <CardMedia
                component="img"
                height={isSmallScreen ? 100 : 140}
                image={item.thumbnail}
                alt={item.title}
                sx={{ objectFit: 'cover', width: '100%', height: isSmallScreen ? 100 : 140, maxHeight: isSmallScreen ? 100 : 140 }}
              />
              <CardContent sx={{ flexGrow: 1, p: { xs: 0.5, sm: 1 } }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  sx={{
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    textOverflow: 'unset',
                    fontSize: { xs: '0.95rem', sm: '1.8vw', md: '1.1rem' },
                    fontWeight: 700,
                    mb: 0.5,
                    lineHeight: 1.2
                  }}
                >
                  {item.title}
                </Typography>
                {item.type === 'video' && item.views && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.4vw', md: '1.1rem' }, fontWeight: 400 }}>
                    {parseInt(item.views).toLocaleString()} views
                  </Typography>
                )}
                {item.type === 'music' && item.artist && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '1.2vw', md: '0.9rem' }, fontWeight: 400 }}>
                    {item.artist} • {item.album}
                  </Typography>
                )}
                {item.type === 'book' && item.author && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '1.2vw', md: '0.9rem' }, fontWeight: 400 }}>
                    {item.author} • {item.rating ? `${item.rating.toFixed(1)} ★` : 'No rating'}
                  </Typography>
                )}
                {item.type === 'podcast' && item.author && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '1.2vw', md: '0.9rem' }, fontWeight: 400 }}>
                    {item.author} • {item.episodeCount} episodes
                  </Typography>
                )}
                {item.type === 'news' && item.author && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '1.2vw', md: '0.9rem' }, fontWeight: 400 }}>
                    {item.author} • {item.source}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function HomePageContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [trendingContent, setTrendingContent] = useState<{
    videos: TrendingItem[];
    music: TrendingItem[];
    books: TrendingItem[];
    podcasts: TrendingItem[];
    news: TrendingItem[];
  }>({
    videos: [],
    music: [],
    books: [],
    podcasts: [],
    news: [],
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from signup
  useEffect(() => {
    const success = searchParams.get('success');
    const message = searchParams.get('message');
    
    if (success === 'true' || message) {
      const displayMessage = message || 'Account created successfully! Welcome to Telecast!';
      setSuccessMessage(displayMessage);
      
      // Clear the success parameter from URL
      router.replace('/', { scroll: false });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchTrendingContent = async () => {
      try {
        const response = await fetch('/api/trending');
        if (!response.ok) {
          throw new Error('Failed to fetch trending content');
        }
        const data = await response.json();
        console.log('Fetched trending content:', data);
        setTrendingContent(data);
      } catch (err) {
        console.error('Error fetching trending content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch trending content');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingContent();
  }, []);

  const handleItemClick = (item: TrendingItem) => {
    switch (item.type) {
      case 'video':
        router.push(`/video/${item.id}`);
        break;
      case 'music':
        router.push(`/music/${item.id}`);
        break;
      case 'book':
        router.push(`/book/${item.id}`);
        break;
      case 'podcast':
        router.push(`/podcast/${item.id}`);
        break;
      case 'news':
        if (item.url) {
          window.open(item.url, '_blank');
        }
        break;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ 
      py: { xs: 1, sm: 1.5 },
      px: { xs: 1, sm: 2 }
    }}>
      {/* CTA for podcast recording */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: 2,
        px: { xs: 2, sm: 0 }
      }}>
        <a href="/my-podcasts" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: '#2563eb',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              textDecorationThickness: '2px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#1d4ed8',
                transform: 'translateY(-1px)',
                '& span:last-child': {
                  transform: 'translateX(2px)',
                },
              },
            }}
          >
            <span>Create your own podcast</span>
            <span style={{ 
              fontSize: '0.9em',
              display: 'inline-block',
              marginLeft: '6px',
              color: '#1d4ed8',
              fontWeight: 'bold',
              transition: 'transform 0.2s ease'
            }}>
              ↗
            </span>
          </Box>
        </a>
        <Box sx={{ 
          textAlign: 'center', 
          color: '#2563eb', 
          fontWeight: 500, 
          fontSize: { xs: '0.8rem', sm: '0.9rem' }, 
          mt: 1, 
          letterSpacing: 0.2,
          opacity: 0.8
        }}>
          ✨ No experience needed • One click to start!
        </Box>
      </Box>
      
      {/* Partner Logos */}
      <PartnerLogos />
      
      <Typography
        variant="h6"
        align="center"
        sx={{
          mt: { xs: 1, sm: 0.5 },
          mb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.5, md: 2 },
          fontWeight: 400,
          fontSize: { xs: '0.85rem', sm: '1rem', md: '1.2rem' },
          background: '#2563eb',
          borderRadius: { xs: 3, sm: 5 },
          boxShadow: '0 2px 16px 0 rgba(30, 64, 175, 0.07)',
          color: '#fff',
          letterSpacing: { xs: 0.3, sm: 0.7 },
          maxWidth: { xs: '95%', sm: 720 },
          mx: 'auto',
          fontStyle: 'italic',
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5 },
          transition: 'box-shadow 0.3s',
          animation: 'fadeInTagline 1.2s ease',
          '@keyframes fadeInTagline': {
            from: { opacity: 0, transform: 'translateY(-16px)' },
            to: { opacity: 1, transform: 'none' },
          },
        }}
      >
        <StarIcon sx={{ fontSize: { xs: 16, sm: 18, md: 22 }, color: '#fff', mr: { xs: 0.5, sm: 1 }, opacity: 0.85 }} />
        Your premier destination for podcasts, videos, and music. Discover, listen, and share your favorite content.
      </Typography>
      
      {/* Trending Content */}
      <Box sx={{ 
        mt: { xs: 2, sm: 3 },
        '& > *:not(:last-child)': {
          mb: { xs: 2, sm: 3 }
        }
      }}>
        <ContentCarousel
          title="Trending Videos"
          items={trendingContent.videos}
          onItemClick={handleItemClick}
        />
        <ContentCarousel
          title="Trending Music"
          items={trendingContent.music}
          onItemClick={handleItemClick}
        />
        <ContentCarousel
          title="Trending Books"
          items={trendingContent.books}
          onItemClick={handleItemClick}
        />
        <ContentCarousel
          title="Trending Podcasts"
          items={trendingContent.podcasts}
          onItemClick={handleItemClick}
        />
        <ContentCarousel
          title="Trending News"
          items={trendingContent.news}
          onItemClick={handleItemClick}
        />
      </Box>
      
      {/* Success Message Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success" 
          sx={{
            width: '100%',
            fontFamily: "'Open Sans', Arial, sans-serif",
            fontSize: '0.95rem',
            fontWeight: 500,
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiAlert-icon': {
              fontSize: '1.25rem',
            },
            '& .MuiAlert-message': {
              padding: '8px 0',
            },
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#f0fdf4',
              color: '#166534',
              borderColor: '#bbf7d0',
              '& .MuiAlert-icon': {
                color: '#16a34a',
              },
            },
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default function HomePage() {
  return (
    <SearchParamsWrapper>
      <HomePageContent />
    </SearchParamsWrapper>
  );
}
