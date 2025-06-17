import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Rating,
  Chip,
  Stack,
} from '@mui/material';

// Helper function to ensure HTTPS
const ensureHttps = (url: string | undefined): string => {
  if (!url) return '/book-placeholder.png';
  return url.replace(/^http:/, 'https:');
};

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string;
      smallThumbnail?: string;
    };
    averageRating?: number;
    ratingsCount?: number;
    publishedDate?: string;
    categories?: string[];
    previewLink?: string;
  };
}

interface BookGridProps {
  searchQuery: string;
}

export default function BookGrid({ searchQuery }: BookGridProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchQuery) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch books');
        }
        
        // Process books to ensure HTTPS URLs
        const processedBooks = (data.items || []).map((book: Book) => ({
          ...book,
          volumeInfo: {
            ...book.volumeInfo,
            imageLinks: book.volumeInfo.imageLinks ? {
              thumbnail: ensureHttps(book.volumeInfo.imageLinks.thumbnail),
              smallThumbnail: ensureHttps(book.volumeInfo.imageLinks.smallThumbnail),
            } : undefined
          }
        }));
        
        setBooks(processedBooks);
        setTotalItems(data.totalItems || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchBooks, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (books.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No books found</Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Found {totalItems} results
      </Typography>
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
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
              onClick={() => window.open(book.volumeInfo.previewLink, '_blank')}
            >
              <CardMedia
                component="img"
                height="180"
                image={ensureHttps(book.volumeInfo.imageLinks?.thumbnail)}
                alt={book.volumeInfo.title}
                sx={{ objectFit: 'contain', width: '100%', maxHeight: { xs: 120, sm: 180, md: 300 }, p: { xs: 1, sm: 2 } }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {book.volumeInfo.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {book.volumeInfo.authors?.join(', ')}
                </Typography>
                {book.volumeInfo.averageRating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                      value={book.volumeInfo.averageRating} 
                      precision={0.5} 
                      size="small" 
                      readOnly 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({book.volumeInfo.ratingsCount})
                    </Typography>
                  </Box>
                )}
                {book.volumeInfo.categories && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    {book.volumeInfo.categories.slice(0, 3).map((category) => (
                      <Chip 
                        key={category} 
                        label={category} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {book.volumeInfo.publishedDate?.split('-')[0]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
} 