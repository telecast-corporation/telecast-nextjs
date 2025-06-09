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
} from '@mui/material';
import {
  PlayCircleOutline as VideoIcon,
  MenuBook as BookIcon,
  Headphones as PodcastIcon,
} from '@mui/icons-material';

interface SearchResult {
  type: 'video' | 'book' | 'podcast';
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
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
  author?: string;
  duration?: string;
}

interface UnifiedSearchResultsProps {
  results: SearchResult[];
}

export default function UnifiedSearchResults({ results }: UnifiedSearchResultsProps) {
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
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={3}>
      {results.map((result) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={`${result.type}-${result.id}`}>
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
            onClick={() => result.url && window.open(result.url, '_blank')}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={result.thumbnail || '/placeholder.png'}
                alt={result.title}
                sx={{ objectFit: 'cover' }}
              />
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
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="div" noWrap>
                {result.title}
              </Typography>
              
              {result.type === 'video' && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {result.channelTitle}
                </Typography>
              )}
              
              {result.type === 'book' && (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {result.authors?.join(', ')}
                  </Typography>
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
              
              {result.type === 'podcast' && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {result.author}
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {result.publishedAt || result.publishedDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 