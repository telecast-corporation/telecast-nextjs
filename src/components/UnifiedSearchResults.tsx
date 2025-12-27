
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Rating,
  Chip,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayCircleOutline as VideoIcon,
  MenuBook as BookIcon,
  Headphones as PodcastIcon,
  MusicNote as MusicIcon,
  VolumeUp as SpotifyIcon,
  ArrowBackIos as ArrowLeftIcon,
  ArrowForwardIos as ArrowRightIcon,
  PlayArrow,
  Article as ArticleIcon,
  LiveTv as TVIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { useAudio } from '@/contexts/AudioContext';
import { typography, spacing, borderRadius } from '@/styles/typography';
import React from 'react';
import TVPreviewModal from './TVPreviewModal';

interface SearchResult {
  type: 'video' | 'book' | 'spotify' | 'podcast' | 'music' | 'news' | 'tv';
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  author?: string;
  channelTitle?: string;
  publishedAt?: string;
  authors?: string[];
  publishedDate?: string;
  categories?: string[];
  rating?: number;
  ratingsCount?: number;
  duration?: string;
  narrator?: string;
  audibleUrl?: string;
  published?: boolean;
  album?: string;
  releaseDate?: string;
  previewLink?: string;
  year?: string;
  source?: string;
  sourceUrl?: string;
  previewVideo?: string;
}

interface UnifiedSearchResultsProps {
  results: SearchResult[];
  searchType?: string;
  loading?: boolean;
  trending?: boolean;
}

const TAGLINE_COLORS: Record<string, string> = {
  all: '#2563eb',
  podcast: '#0ea5e9',
  video: '#f59e42',
  tv: '#8b5cf6',
  music: '#10b981',
  book: '#a855f7',
  spotify: '#1DB954',
  news: '#dc2626',
};

export default function UnifiedSearchResults({ results, searchType = 'all', loading = false, trending = false }: UnifiedSearchResultsProps) {
  const [carouselStates, setCarouselStates] = useState<Record<string, number>>({});
  const [tvModalOpen, setTvModalOpen] = useState(false);
  const [selectedTvShow, setSelectedTvShow] = useState<any>(null);
  const { play } = useAudio();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const ITEMS_PER_PAGE = isMobile ? 4 : 6;

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  }

  if (results.length === 0) {
    return (
      <Box textAlign="center" py={spacing.component.lg}>
        <Typography sx={typography.heading}>No results found.</Typography>
        <Typography sx={{ ...typography.body, mt: 1 }}>Try a different search term.</Typography>
      </Box>
    );
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      video: <VideoIcon />,
      book: <BookIcon />,
      spotify: <SpotifyIcon />,
      podcast: <PodcastIcon />,
      music: <MusicIcon />,
      news: <ArticleIcon />,
      tv: <TVIcon />,
    };
    return icons[type] || null;
  };

  const getTypeTitle = (type: string) => {
    const titles: Record<string, string> = {
      video: trending ? 'Trending Videos' : 'Videos',
      book: trending ? 'Trending Books' : 'Books',
      spotify: trending ? 'Trending on Spotify' : 'Spotify',
      podcast: trending ? 'Trending Podcasts' : 'Podcasts',
      music: trending ? 'Trending Music' : 'Music',
      news: trending ? 'Trending News' : 'News',
      tv: trending ? 'Trending TV' : 'TV Shows',
    };
    return titles[type] || type;
  };

  const CONTENT_TYPE_ORDER = ['podcast', 'video', 'tv', 'music', 'book', 'spotify', 'news'];

  const groupedResults = results.reduce((acc, result) => {
    (acc[result.type] = acc[result.type] || []).push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const sortedEntries = Object.entries(groupedResults).sort(([typeA], [typeB]) => CONTENT_TYPE_ORDER.indexOf(typeA) - CONTENT_TYPE_ORDER.indexOf(typeB));

  const getContentUrl = (result: SearchResult) => {
    switch (result.type) {
      case 'podcast':
        if (result.id.startsWith('internal-')) {
          return `/podcast/${result.id.replace(/^internal-/, '')}`;
        } else {
          return `/podcast/external/${result.id}`;
        }
      case 'video':
        return `/video/${result.id}`;
      case 'book':
        return `/book/${result.id}`;
      case 'spotify':
        return `/spotify/${result.id}`;
      case 'music':
        return `/music/${result.id}`;
      case 'news':
      case 'tv':
      default:
        return result.url || '#';
    }
  };

  const handlePlayPodcast = (e: React.MouseEvent, result: SearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    if (result.type === 'podcast') {
      play({ id: result.id, title: result.title, author: result.author || '', description: result.description || '', image: result.thumbnail || '', url: result.url || '' }, { id: result.id, title: result.title, description: result.description || '', audioUrl: result.url || '', duration: Number(result.duration) || 0, publishDate: result.publishedAt || result.publishedDate || '', imageUrl: result.thumbnail || '' });
    }
  };

  const handleTvClick = (e: React.MouseEvent, result: SearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    if (result.type === 'tv') {
      setSelectedTvShow(result);
      setTvModalOpen(true);
    }
  };

  const renderCard = (result: SearchResult) => {
    const contentUrl = getContentUrl(result);
    const isExternal = contentUrl.startsWith('http');

    const cardContent = (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: borderRadius.medium, '&:hover': { boxShadow: 6 } }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia component="img" image={result.thumbnail || '/placeholder.png'} alt={result.title} sx={{ height: 140, objectFit: 'cover' }} />
          {result.type === 'podcast' && (
            <IconButton onClick={(e) => handlePlayPodcast(e, result)} sx={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' } }}>
              <PlayArrow sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, p: spacing.component.xs }}>
          <Typography gutterBottom sx={{ ...typography.subheading, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {result.title}
          </Typography>
          {result.author && <Typography variant="body2" color="text.secondary" sx={typography.caption}>{result.author}</Typography>}
          {result.type === 'book' && result.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Rating value={result.rating} precision={0.5} size="small" readOnly />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>({result.ratingsCount})</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );

    const linkContent = isExternal ? 
      <a href={contentUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>{cardContent}</a> :
      <Link href={contentUrl} style={{ textDecoration: 'none', color: 'inherit' }}>{cardContent}</Link>;

    if (result.type === 'tv') return <Box onClick={(e) => handleTvClick(e, result)} sx={{ cursor: 'pointer' }}>{cardContent}</Box>;
    if (result.type === 'podcast') return linkContent;
    return linkContent;
  };

  const renderVerticalList = (typeResults: SearchResult[]) => (
    <Stack spacing={2}>
      {typeResults.map((result) => {
        const contentUrl = getContentUrl(result);
        const isExternal = contentUrl.startsWith('http');
        const listItemContent = (
          <Card sx={{ display: 'flex', width: '100%', borderRadius: borderRadius.medium, '&:hover': { boxShadow: 4 } }}>
            <CardMedia component="img" image={result.thumbnail || '/placeholder.png'} alt={result.title} sx={{ width: 120, height: 120, objectFit: 'cover' }} />
            <CardContent sx={{ flex: 1, p: spacing.component.xs }}>
              <Typography gutterBottom sx={typography.subheading}>{result.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={typography.caption}>{result.author || result.channelTitle}</Typography>
              {result.type === 'book' && result.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={result.rating} precision={0.5} size="small" readOnly />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>({result.ratingsCount})</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );

        const linkContent = isExternal ?
          <a href={contentUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }} key={result.id}>{listItemContent}</a> :
          <Link href={contentUrl} style={{ textDecoration: 'none', color: 'inherit' }} key={result.id}>{listItemContent}</Link>; 

        if (result.type === 'tv') return <Box onClick={(e) => handleTvClick(e, result)} sx={{ cursor: 'pointer' }} key={result.id}>{listItemContent}</Box>;
        return linkContent;
      })}
    </Stack>
  );

  const renderCarousel = (type: string, typeResults: SearchResult[]) => {
    const startIndex = carouselStates[type] || 0;
    const visibleItems = typeResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const hasNext = startIndex + ITEMS_PER_PAGE < typeResults.length;
    const hasPrev = startIndex > 0;

    const handleNext = () => setCarouselStates(prev => ({ ...prev, [type]: Math.min(startIndex + ITEMS_PER_PAGE, typeResults.length - ITEMS_PER_PAGE) }));
    const handlePrev = () => setCarouselStates(prev => ({ ...prev, [type]: Math.max(startIndex - ITEMS_PER_PAGE, 0) }));

    return (
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={2}>
          {visibleItems.map((result) => (
            <Grid item xs={12} sm={4} md={3} lg={2} key={`${result.type}-${result.id}`}>
              {renderCard(result)}
            </Grid>
          ))}
        </Grid>
        {hasPrev && <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'background.paper', boxShadow: 2, '&:hover': { backgroundColor: 'background.default' } }}><ArrowLeftIcon /></IconButton>}
        {hasNext && <IconButton onClick={handleNext} sx={{ position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'background.paper', boxShadow: 2, '&:hover': { backgroundColor: 'background.default' } }}><ArrowRightIcon /></IconButton>}
      </Box>
    );
  };

  return (
    <Box>
      <Typography
        align="center"
        sx={{
          ...typography.body,
          mt: spacing.section.xs,
          mb: spacing.section.sm,
          p: spacing.component.sm,
          background: TAGLINE_COLORS[searchType?.toLowerCase() || 'all'] || TAGLINE_COLORS.all,
          borderRadius: borderRadius.large,
          color: '#fff',
          maxWidth: 720,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        <StarIcon />
        Your premier destination for podcasts, videos, and music. Discover, listen, and share.
      </Typography>
      {sortedEntries.map(([type, typeResults], index) => (
        <Box key={type} sx={{ mb: spacing.section.md }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: spacing.gap.sm }}>
            {getTypeIcon(type)}
            <Typography variant="h5" component="h2" sx={{ ...typography.title, ml: 1 }}>
              {getTypeTitle(type)}
            </Typography>
          </Box>

          {searchType === 'all' && type !== 'news' ? renderCarousel(type, typeResults) : renderVerticalList(typeResults)}

          {index < sortedEntries.length - 1 && <Divider sx={{ my: spacing.section.sm }} />}
        </Box>
      ))}
      
      <TVPreviewModal open={tvModalOpen} onClose={() => setTvModalOpen(false)} tvShow={selectedTvShow} />
    </Box>
  );
}
