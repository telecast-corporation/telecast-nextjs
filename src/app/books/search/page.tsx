'use client';

import { useState, useEffect } from 'react';
import { Container, TextField, Box, Typography } from '@mui/material';
import BookGrid from '@/components/BookGrid';
import { TrendingItem } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

export default function BookSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<TrendingItem[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchQuery.trim() !== '') {
        try {
          const [bookResponse, audiobookResponse] = await Promise.all([
            fetch(`/api/book?q=${debouncedSearchQuery}`),
            fetch(`/api/audiobook?q=${debouncedSearchQuery}`),
          ]);

          const books = await bookResponse.json();
          const audiobooks = await audiobookResponse.json();

          const combinedResults = [
            ...(books.map((book: any) => ({ ...book, type: 'book' })) || []),
            ...(audiobooks.map((audiobook: any) => ({ ...audiobook, type: 'audiobook' })) || []),
          ];

          setResults(combinedResults);
        } catch (error) {
          console.error('Failed to fetch search results:', error);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    };

    fetchResults();
  }, [debouncedSearchQuery]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search for Books and Audiobooks
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search by title, author, or keyword"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <BookGrid books={results} />
    </Container>
  );
}
