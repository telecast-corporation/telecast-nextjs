'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Rating,
  Paper,
  Button,
} from '@mui/material';
import {
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
  MenuBook as MenuBookIcon,
  LocalLibrary as LibraryIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface BookDetails {
  id: string;
  title: string;
  author: {
    name: string;
    image: string;
  };
  details: {
    publisher: string;
    publishedDate: string;
    pageCount: string | number;
    language: string;
    isbn: string;
  };
  description: string;
  cover: string;
  categories: string[];
  rating: number;
  ratingCount: number;
  relatedBooks: {
    id: string;
    title: string;
    author: string;
    thumbnail: string;
    description: string;
  }[];
  previewLink?: string;
}

// Helper to ensure HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/book/${params.id}`);
        setBook(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching book details:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load book details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBookDetails();
    }
  }, [params.id]);

  const handleBookClick = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Book not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <CardMedia
              component="img"
              image={ensureHttps(book.cover)}
              alt={book.title}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
                objectFit: 'cover',
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {book.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="action" />
                <Typography variant="h6" color="text.secondary">
                  {book.author.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={book.rating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({book.ratingCount} ratings)
                </Typography>
              </Box>
              {book.categories.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {book.categories.map((category) => (
                    <Chip key={category} label={category} />
                  ))}
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<MenuBookIcon />}
                  component="a"
                  href={book.previewLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!book.previewLink}
                >
                  Read
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Book Details */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              About this book
            </Typography>
            <Typography 
              color="text.secondary" 
              paragraph
              sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: book.description }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1.05rem' }}>
              Book Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LibraryIcon color="action" />
                <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Publisher: {book.details.publisher}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="action" />
                <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Published: {book.details.publishedDate}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon color="action" />
                <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Pages: {book.details.pageCount}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon color="action" />
                <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Language: {book.details.language}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Related Books */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Related Books
        </Typography>
        <List>
          {book.relatedBooks.map((relatedBook, index) => (
            <React.Fragment key={relatedBook.id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  minHeight: 64,
                  py: 1,
                  px: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleBookClick(relatedBook.id)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={ensureHttps(relatedBook.thumbnail)}
                    alt={relatedBook.title}
                    variant="rounded"
                    sx={{ width: 20, height: 28 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
                      {relatedBook.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="caption" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                        {relatedBook.author}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {relatedBook.description.length > 100
                          ? `${relatedBook.description.substring(0, 100)}...`
                          : relatedBook.description}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < book.relatedBooks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
} 