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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Search as SearchIcon, Headphones as HeadphonesIcon, VideoLibrary as VideoIcon, MusicNote as MusicIcon, MenuBook as BookIcon } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';

interface TrendingItem {
    id: string;
  type: 'video' | 'music' | 'book' | 'podcast';
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
                height={isSmallScreen ? 100 : 200}
                image={item.thumbnail}
                alt={item.title}
                sx={{ objectFit: 'cover', width: '100%', maxHeight: isSmallScreen ? 100 : { xs: 140, sm: 180, md: 200 } }}
              />
              <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  sx={{
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    textOverflow: 'unset',
                    fontSize: { xs: '1.1rem', sm: '2.5vw', md: '1.5rem' },
                    fontWeight: 800,
                    mb: 0.5,
                  }}
                >
                  {item.title}
                </Typography>
                {item.type === 'video' && item.views && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.3vw', md: '1rem' }, fontWeight: 400 }}>
                    {parseInt(item.views).toLocaleString()} views
                  </Typography>
                )}
                {item.type === 'music' && item.artist && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.3vw', md: '1rem' }, fontWeight: 400 }}>
                    {item.artist} • {item.album}
                  </Typography>
                )}
                {item.type === 'book' && item.author && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.3vw', md: '1rem' }, fontWeight: 400 }}>
                    {item.author} • {item.rating ? `${item.rating.toFixed(1)} ★` : 'No rating'}
                  </Typography>
                )}
                {item.type === 'podcast' && item.author && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.3vw', md: '1rem' }, fontWeight: 400 }}>
                    {item.author} • {item.episodeCount} episodes
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

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendingContent, setTrendingContent] = useState<{
    videos: TrendingItem[];
    music: TrendingItem[];
    books: TrendingItem[];
    podcasts: TrendingItem[];
  }>({
    videos: [],
    music: [],
    books: [],
    podcasts: [],
  });
  const router = useRouter();

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
    <Container>
      {/* Trending Content */}
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
    </Container>
  );
}
