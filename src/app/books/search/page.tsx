'use client';

import { useState, useEffect } from 'react';
import { Container, TextField, Box, Typography } from '@mui/material';
import BookGrid from '@/components/BookGrid';
import { TrendingItem } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

export default function BookSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<TrendingItem[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchBooks = async () => {
      if (debouncedSearchQuery.trim() !== '') {
        try {
          const response = await fetch(`/api/book?q=${debouncedSearchQuery}`);
          const data = await response.json();
          setBooks(data || []);
        } catch (error) {
          console.error('Failed to fetch books:', error);
          setBooks([]);
        }
      } else {
        setBooks([]);
      }
    };

    fetchBooks();
  }, [debouncedSearchQuery]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Search
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search books"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter book title, author, or ISBN..."
        />
      </Box>

      <BookGrid books={books} />
    </Container>
  );
}
