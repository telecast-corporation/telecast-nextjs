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
  Avatar,
} from '@mui/material';
import {
  PlayCircleOutline as VideoIcon,
  MenuBook as BookIcon,
  Headphones as PodcastIcon,
  MusicNote as MusicIcon,
  VolumeUp as AudiobookIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  PlayArrow,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { useAudio } from '@/contexts/AudioContext';
import { typography } from '@/styles/typography';
import React from 'react';
import StarIcon from '@mui/icons-material/Star';

interface SearchResult {
  type: 'video' | 'book' | 'audiobook' | 'podcast' | 'music' | 'news';
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
  // Audiobook specific
  duration?: string;
  narrator?: string;
  audibleUrl?: string;
  // Podcast specific
  published?: boolean; // For internal podcasts
  // Music specific
  album?: string;
  releaseDate?: string;
  previewLink?: string;
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
  audiobook: '#f97316',
  news: '#dc2626',
};

export default function UnifiedSearchResults({ results, searchType = 'all', loading = false, trending = false }: UnifiedSearchResultsProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [carouselStates, setCarouselStates] = useState<Record<string, number>>({});
  const { play } = useAudio();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const ITEMS_PER_PAGE = isSmallScreen ? 6 : 12;

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
      case 'audiobook':
        return <AudiobookIcon />;
      case 'podcast':
        return <PodcastIcon />;
      case 'music':
        return <MusicIcon />;
      case 'news':
        return <ArticleIcon />;
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
      case 'audiobook':
        return trending ? 'Trending Audiobooks' : 'Audiobooks';
      case 'podcast':
        return trending ? 'Trending Podcasts' : 'Podcasts';
      case 'music':
        return trending ? 'Trending Music' : 'Music';
      case 'news':
        return trending ? 'Trending News' : 'News';
      default:
        return type;
    }
  };

  // Define the order of content types
  const CONTENT_TYPE_ORDER = ['podcast', 'video', 'music', 'book', 'audiobook', 'news'];

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
        {
          const idString = String(result.id);
          if (idString.startsWith('internal-')) {
            return `/podcast/${idString.replace(/^internal-/, '')}`;
          }
          return `/podcast/external/${idString}`;
        }
      case 'video':
        return `/video/${result.id}`;
      case 'book':
        return `/book/${result.id}`;
      case 'audiobook':
        // Always use the real Audible URL, never fall back to local route
        const audiobookUrl = result.audibleUrl || result.url || `https://www.audible.ca/search?keywords=${encodeURIComponent(result.title)}`;
        console.log('🎧 Audiobook URL Debug:', { 
          title: result.title, 
          audibleUrl: result.audibleUrl, 
          url: result.url, 
          finalUrl: audiobookUrl,
          hasAudibleUrl: !!result.audibleUrl,
          hasUrl: !!result.url,
          isExternal: audiobookUrl.startsWith('http'),
          resultKeys: Object.keys(result)
        });
        return audiobookUrl;
      case 'music':
        return `/music/${result.id}`;
      case 'news':
        return result.url || '#';
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
    const isExternal = contentUrl.startsWith('http');

    console.log('🔗 Card URL Debug:', {
      title: result.title,
      type: result.type,
      contentUrl,
      isExternal,
      resultUrl: result.url,
      audibleUrl: result.audibleUrl,
      willUseExternalLink: isExternal && result.type !== 'podcast'
    });

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
              height: 120,
              maxHeight: 120,
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
          
          {result.type === 'podcast' && result.published !== undefined && (
            <Chip 
              label={result.published ? 'Published' : 'Draft'} 
              size="small" 
              color={result.published ? 'success' : 'default'}
              variant={result.published ? 'filled' : 'outlined'}
              sx={{ 
                fontSize: '0.25rem', 
                height: 'auto', 
                mb: 0.5,
                '& .MuiChip-label': { 
                  px: 0.5, 
                  py: 0.2 
                } 
              }}
            />
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
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.3rem' }} component="span">
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
          
          {result.type === 'audiobook' && (
            <>
              {result.duration && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: { xs: '0.25rem', sm: '0.3rem', md: '0.35rem', lg: '0.4rem' },
                    mb: 0.2,
                  }}
                >
                  Duration: {result.duration}
                </Typography>
              )}
              {result.narrator && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: { xs: '0.25rem', sm: '0.3rem', md: '0.35rem', lg: '0.4rem' },
                    mb: 0.2,
                  }}
                >
                  Narrated by: {result.narrator}
                </Typography>
              )}
              {result.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Rating 
                    value={result.rating} 
                    precision={0.5} 
                    size="small" 
                    readOnly 
                    sx={{ fontSize: '0.7rem' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.3rem' }} component="span">
                    ({result.ratingsCount})
                  </Typography>
                </Box>
              )}
            </>
          )}
          
          <Typography 
            variant="caption" 
            color="text.secondary" 
            component="span"
            sx={{ mt: 0.5, display: 'block', fontSize: '0.9rem' }}
          >
            {result.publishedAt || result.publishedDate || result.releaseDate}
          </Typography>
        </CardContent>
      </Card>
    );

    if (result.type === 'podcast') {
      console.log('🔗 Rendering podcast card (no link)');
      return cardContent;
    }

    if (isExternal) {
      console.log('🔗 Rendering external link for:', result.title, 'URL:', contentUrl);
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

    console.log('🔗 Rendering internal link for:', result.title, 'URL:', contentUrl);
    return (
      <Link href={contentUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        {cardContent}
      </Link>
    );
  };

  const renderVerticalList = (typeResults: SearchResult[]) => (
    <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
      {typeResults.map((result) => {
        const contentUrl = getContentUrl(result);
        const isExternal = contentUrl.startsWith('http');

        console.log('🔗 Vertical List URL Debug:', {
          title: result.title,
          type: result.type,
          contentUrl,
          isExternal,
          resultUrl: result.url,
          audibleUrl: result.audibleUrl,
          willUseExternalLink: isExternal && result.type !== 'podcast'
        });

        const listItemContent = (
          <Card 
            sx={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'stretch',
              '&:hover': {
                boxShadow: 6,
                cursor: 'pointer',
              },
            }}
          >
            <Box sx={{ position: 'relative', width: 120, height: 120, flexShrink: 0, p: 0, m: 0 }}>
              <CardMedia
                component="img"
                image={result.thumbnail || '/placeholder.png'}
                alt={result.title}
                sx={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  p: 0,
                  m: 0,
                  borderRadius: 0,
                  display: 'block',
                }}
              />
            </Box>
            <CardContent sx={{ flexGrow: 1, minWidth: 0, width: '100%', p: 1 }}>
              <Typography
                gutterBottom
                variant="h6"
                component="div"
                sx={{
                  ...typography.heading,
                  whiteSpace: result.type === 'book' ? 'normal' : 'nowrap',
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
                    fontWeight: 400,
                    mb: 0.1,
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
                    sx={{ fontSize: '1rem' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.8rem' }} component="span">
                    ({result.ratingsCount})
                  </Typography>
                </Box>
              )}
              {result.type === 'book' && result.categories && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.3 }}>
                  {result.categories.slice(0, 2).map((category) => (
                    <Chip 
                      key={category} 
                      label={category} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.8rem', 
                        height: 'auto', 
                        '& .MuiChip-label': { px: 0.5, py: 0.2 } 
                      }}
                    />
                  ))}
                </Stack>
              )}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                component="span"
                sx={{ mt: 0.5, display: 'block', fontSize: '0.9rem' }}
              >
                {result.publishedAt || result.publishedDate || result.releaseDate}
              </Typography>
            </CardContent>
          </Card>
        );

        if (isExternal) {
          console.log('🔗 Vertical List: Rendering external link for:', result.title, 'URL:', contentUrl);
          return (
            <a 
              href={contentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
              key={result.id}
            >
              {listItemContent}
            </a>
          );
        }

        console.log('🔗 Vertical List: Rendering internal link for:', result.title, 'URL:', contentUrl);
        return (
          <Link href={contentUrl} style={{ textDecoration: 'none', color: 'inherit' }} key={result.id}>
            {listItemContent}
          </Link>
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
          mt: { xs: 1, sm: 0.5 },
          mb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.5, md: 2 },
          fontWeight: 400,
          fontSize: { xs: '0.85rem', sm: '1rem', md: '1.2rem' },
          background: TAGLINE_COLORS[searchType?.toLowerCase() || 'all'] || '#2563eb',
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

          {searchType === 'all' && type !== 'news' ? (
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