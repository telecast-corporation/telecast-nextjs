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
  Button,
  List,
  ListItem,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayCircleOutline as VideoIcon,
  MenuBook as BookIcon,
  Headphones as PodcastIcon,
  MusicNote as MusicIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  PlayArrow,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { useAudio } from '@/contexts/AudioContext';
import { typography } from '@/styles/typography';
import React from 'react';
import StarIcon from '@mui/icons-material/Star';

interface SearchResult {
  type: 'video' | 'book' | 'podcast' | 'music';
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  author?: string;
  // Video specific
  channelTitle?: string;
  publishedAt?: string;
  // Book specific
  authors?: string[];
  publishedDate?: string;
  categories?: string[];
  rating?: number;
  ratingsCount?: number;
  // Podcast specific
  duration?: string;
  // Music specific
  album?: string;
  releaseDate?: string;
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
  music: '#10b981',
  book: '#a855f7',
};

export default function UnifiedSearchResults({ results, searchType = 'all', loading = false, trending = false }: UnifiedSearchResultsProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [carouselStates, setCarouselStates] = useState<Record<string, number>>({});
  const { play } = useAudio();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const ITEMS_PER_PAGE = isSmallScreen ? 2 : 4;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No results found</Typography>
      </Box>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoIcon />;
      case 'book':
        return <BookIcon />;
      case 'podcast':
        return <PodcastIcon />;
      case 'music':
        return <MusicIcon />;
      default:
        return null;
    }
  };

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'video':
        return trending ? 'Trending Videos' : 'Videos';
      case 'book':
        return trending ? 'Trending Books' : 'Books';
      case 'podcast':
        return trending ? 'Trending Podcasts' : 'Podcasts';
      case 'music':
        return trending ? 'Trending Music' : 'Music';
      default:
        return type;
    }
  };

  // Define the order of content types
  const CONTENT_TYPE_ORDER = ['podcast', 'video', 'music', 'book'];

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Sort the entries based on the defined order
  const sortedEntries = Object.entries(groupedResults).sort(([typeA], [typeB]) => {
    const indexA = CONTENT_TYPE_ORDER.indexOf(typeA);
    const indexB = CONTENT_TYPE_ORDER.indexOf(typeB);
    return indexA - indexB;
  });

  const getContentUrl = (result: SearchResult) => {
    switch (result.type) {
      case 'podcast':
        return `/podcast/${result.id}`;
      case 'video':
        return `/video/${result.id}`;
      case 'book':
        return `/book/${result.id}`;
      case 'music':
        return `/music/${result.id}`;
      default:
        return result.url || '#';
    }
  };

  const handlePlayPodcast = (e: React.MouseEvent, result: SearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (result.type === 'podcast') {
      const podcast = {
        id: Number(result.id),
        title: result.title,
        author: result.author || '',
        description: result.description || '',
        image: result.thumbnail || '',
        url: result.url || '',
      };
      
      const episode = {
        id: Number(result.id),
        title: result.title,
        description: result.description || '',
        audioUrl: result.url || '',
        duration: Number(result.duration) || 0,
        publishDate: result.publishedAt || '',
      };
      
      play(podcast, episode);
    }
  };

  const renderCard = (result: SearchResult) => {
    const contentUrl = getContentUrl(result);
    const isExternal = result.url && !contentUrl.startsWith('/');

    const cardContent = (
      <Card 
        sx={{ 
          height: { xs: 'auto', sm: '100%' }, 
          display: 'flex', 
          flexDirection: 'column',
          '&:hover': {
            boxShadow: 6,
            cursor: 'pointer',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            image={result.thumbnail || '/placeholder.png'}
            alt={result.title}
            sx={{
              objectFit: 'cover',
              width: '100%',
              height: { xs: 25, sm: 30, md: 35, lg: 40 },
              maxHeight: { xs: 25, sm: 30, md: 35, lg: 40 },
            }}
          />
          {result.type === 'podcast' ? (
            <IconButton
              onClick={(e) => handlePlayPodcast(e, result)}
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                width: 24,
                height: 24,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <PlayArrow sx={{ fontSize: 16 }} />
            </IconButton>
          ) : (
            getTypeIcon(result.type) &&
              React.cloneElement(getTypeIcon(result.type) as React.ReactElement, { sx: { fontSize: 16 } })
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, p: { xs: 0.15, sm: 0.25, md: 0.4, lg: 0.5 } }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              ...typography.heading,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              textOverflow: 'unset',
              fontWeight: 700,
              mb: 0.1,
              lineHeight: 1.2,
            }}
          >
            {result.title}
          </Typography>
          {result.author && (
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{
                ...typography.body,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                textOverflow: 'unset',
                fontWeight: 400,
                mb: 0.1,
                lineHeight: 1.1,
              }}
            >
              {result.author}
            </Typography>
          )}
          
          {result.type === 'book' && (
            <>
              {result.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Rating 
                    value={result.rating} 
                    precision={0.5} 
                    size="small" 
                    readOnly 
                    sx={{ fontSize: '0.7rem' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.3rem' }}>
                    ({result.ratingsCount})
                  </Typography>
                </Box>
              )}
              {result.categories && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.3 }}>
                  {result.categories.slice(0, 2).map((category) => (
                    <Chip 
                      key={category} 
                      label={category} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.25rem', 
                        height: 'auto', 
                        '& .MuiChip-label': { 
                          px: 0.5, 
                          py: 0.2 
                        } 
                      }}
                    />
                  ))}
                </Stack>
              )}
            </>
          )}
          
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              mt: 0.5, 
              display: 'block',
              fontSize: { xs: '0.25rem', sm: '0.3rem', md: '0.35rem', lg: '0.4rem' }
            }}
          >
            {result.publishedAt || result.publishedDate || result.releaseDate}
          </Typography>
        </CardContent>
      </Card>
    );

    if (result.type === 'podcast') {
      return cardContent;
    }

    if (isExternal) {
      return (
        <a 
          href={contentUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {cardContent}
        </a>
      );
    }

    return (
      <Link href={contentUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        {cardContent}
      </Link>
    );
  };

  const renderVerticalList = (typeResults: SearchResult[]) => (
    <List>
      {typeResults.map((result) => {
        const contentUrl = getContentUrl(result);
        const isExternal = result.url && !contentUrl.startsWith('/');

        const listItemContent = (
          <Card 
            sx={{ 
              width: '100%',
              display: 'flex',
              '&:hover': {
                boxShadow: 6,
                cursor: 'pointer',
              },
            }}
          >
            <Box sx={{ position: 'relative', width: 120, flexShrink: 0 }}>
              <CardMedia
                component="img"
                height="120"
                image={result.thumbnail || '/placeholder.png'}
                alt={result.title}
                sx={{ objectFit: 'cover', height: '100%' }}
              />
            </Box>
            <CardContent sx={{ flexGrow: 1, minWidth: 0, width: '100%', p: 1 }}>
              <Typography
                gutterBottom
                variant="h6"
                component="div"
                sx={{
                  ...typography.heading,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  textOverflow: 'unset',
                  fontSize: { xs: '3.5vw', sm: '2vw', md: '1.2rem' },
                  fontWeight: 700,
                  mb: 0.3,
                  lineHeight: 1.2,
                }}
              >
                {result.title}
              </Typography>
              {result.author && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    ...typography.body,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    textOverflow: 'unset',
                    fontSize: { xs: '2.5vw', sm: '1.1vw', md: '0.8rem' },
                    fontWeight: 400,
                    mb: 0.3,
                    lineHeight: 1.1,
                  }}
                >
                  {result.author}
                </Typography>
              )}
              {result.type === 'book' && result.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Rating 
                    value={result.rating} 
                    precision={0.5} 
                    size="small" 
                    readOnly 
                    sx={{ fontSize: '0.8rem' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.7rem' }}>
                    ({result.ratingsCount})
                  </Typography>
                </Box>
              )}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  mt: 0.5, 
                  display: 'block',
                  fontSize: { xs: '2vw', sm: '0.9vw', md: '0.7rem' }
                }}
              >
                {result.publishedAt || result.publishedDate || result.releaseDate}
              </Typography>
            </CardContent>
          </Card>
        );

        return (
          <ListItem
            key={`${result.type}-${result.id}`}
            sx={{
              mb: 1,
              p: 0,
            }}
          >
            {isExternal ? (
              <a 
                href={contentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
              >
                {listItemContent}
              </a>
            ) : (
              <Link href={contentUrl} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                {listItemContent}
              </Link>
            )}
          </ListItem>
        );
      })}
    </List>
  );

  const handleCarouselNext = (type: string, totalItems: number) => {
    setCarouselStates(prev => ({
      ...prev,
      [type]: Math.min((prev[type] || 0) + ITEMS_PER_PAGE, totalItems - ITEMS_PER_PAGE)
    }));
  };

  const handleCarouselPrev = (type: string) => {
    setCarouselStates(prev => ({
      ...prev,
      [type]: Math.max((prev[type] || 0) - ITEMS_PER_PAGE, 0)
    }));
  };

  const renderCarousel = (type: string, typeResults: SearchResult[]) => {
    const startIndex = carouselStates[type] || 0;
    const visibleItems = typeResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const hasNext = startIndex + ITEMS_PER_PAGE < typeResults.length;
    const hasPrev = startIndex > 0;

    return (
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={2}>
          {visibleItems.map((result) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={`${result.type}-${result.id}`}>
              {renderCard(result)}
            </Grid>
          ))}
        </Grid>
        
        {typeResults.length > ITEMS_PER_PAGE && (
          <>
            {hasPrev && (
              <IconButton
                onClick={() => handleCarouselPrev(type)}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    backgroundColor: 'background.paper',
                    boxShadow: 2,
                  },
                }}
              >
                <ArrowLeftIcon />
              </IconButton>
            )}
            {hasNext && (
              <IconButton
                onClick={() => handleCarouselNext(type, typeResults.length)}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    backgroundColor: 'background.paper',
                    boxShadow: 2,
                  },
                }}
              >
                <ArrowRightIcon />
              </IconButton>
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 0, pt: 0 }}>
      <Typography
        variant="h6"
        align="center"
        sx={{
          mt: 4,
          mb: 4,
          px: 3,
          py: 2,
          fontWeight: 400,
          fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
          background: TAGLINE_COLORS[searchType?.toLowerCase() || 'all'] || '#2563eb',
          borderRadius: 5,
          boxShadow: '0 2px 16px 0 rgba(30, 64, 175, 0.07)',
          color: '#fff',
          letterSpacing: 0.7,
          maxWidth: 720,
          mx: 'auto',
          fontStyle: 'italic',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          transition: 'box-shadow 0.3s',
          animation: 'fadeInTagline 1.2s ease',
          '@keyframes fadeInTagline': {
            from: { opacity: 0, transform: 'translateY(-16px)' },
            to: { opacity: 1, transform: 'none' },
          },
        }}
      >
        <StarIcon sx={{ fontSize: { xs: 18, sm: 20, md: 22 }, color: '#fff', mr: 1, opacity: 0.85 }} />
        Your premier destination for podcasts, videos, and music. Discover, listen, and share your favorite content.
      </Typography>
      {sortedEntries.map(([type, typeResults], index) => (
        <Box key={type} sx={{ mt: 0, pt: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0, mt: 0, pt: 0 }}>
            <IconButton sx={{ mr: 0 }}>
              {getTypeIcon(type)}
            </IconButton>
            <Typography variant="h5" component="h2">
              {getTypeTitle(type)}
            </Typography>
          </Box>

          {searchType === 'all' ? (
            renderCarousel(type, typeResults)
          ) : (
            renderVerticalList(typeResults)
          )}

          {index < sortedEntries.length - 1 && (
            <Divider sx={{ my: 3 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}