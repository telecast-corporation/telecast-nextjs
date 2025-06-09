'use client';

import { useState } from 'react';
import { Container, TextField, Box, Typography } from '@mui/material';
import BookGrid from '@/components/BookGrid';

export default function BookSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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
          onChange={handleSearch}
          placeholder="Enter book title, author, or ISBN..."
        />
      </Box>

      {searchQuery && <BookGrid searchQuery={searchQuery} />}
    </Container>
  );
} 