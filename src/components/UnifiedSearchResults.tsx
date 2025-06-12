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
}

export default function UnifiedSearchResults({ results, searchType = 'all' }: UnifiedSearchResultsProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [carouselStates, setCarouselStates] = useState<Record<string, number>>({});
  const { play } = useAudio();
  const ITEMS_PER_PAGE = 4;

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
        return 'Videos';
      case 'book':
        return 'Books';
      case 'podcast':
        return 'Podcasts';
      case 'music':
        return 'Music';
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
          height: '100%', 
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
            height="200"
            image={result.thumbnail || '/placeholder.png'}
            alt={result.title}
            sx={{ objectFit: 'cover' }}
          />
          {result.type === 'podcast' ? (
            <IconButton
              onClick={(e) => handlePlayPodcast(e, result)}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <PlayArrow />
            </IconButton>
          ) : (
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            {getTypeIcon(result.type)}
          </IconButton>
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {result.title}
          </Typography>
          
          {result.author && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {result.author}
            </Typography>
          )}
          
          {result.type === 'book' && (
            <>
              {result.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={result.rating} 
                    precision={0.5} 
                    size="small" 
                    readOnly 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({result.ratingsCount})
                  </Typography>
                </Box>
              )}
              {result.categories && (
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {result.categories.slice(0, 2).map((category) => (
                    <Chip 
                      key={category} 
                      label={category} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
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
            <Box sx={{ position: 'relative', width: 200, flexShrink: 0 }}>
              <CardMedia
                component="img"
                height="200"
                image={result.thumbnail || '/placeholder.png'}
                alt={result.title}
                sx={{ objectFit: 'cover', height: '100%' }}
              />
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="div">
                {result.title}
              </Typography>
              {result.author && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {result.author}
                </Typography>
              )}
              {result.type === 'book' && result.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={result.rating} 
                    precision={0.5} 
                    size="small" 
                    readOnly 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({result.ratingsCount})
                  </Typography>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {result.publishedAt || result.publishedDate || result.releaseDate}
              </Typography>
            </CardContent>
          </Card>
        );

        return (
          <ListItem
            key={`${result.type}-${result.id}`}
            sx={{
              mb: 2,
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
        <Grid container spacing={3}>
          {visibleItems.map((result) => (
            <Grid item xs={12} sm={6} md={3} key={`${result.type}-${result.id}`}>
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
    <Box>
      {sortedEntries.map(([type, typeResults], index) => (
        <Box key={type} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton sx={{ mr: 1 }}>
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
            <Divider sx={{ my: 4 }} />
          )}
        </Box>
      ))}
    </Box>
  );
} 