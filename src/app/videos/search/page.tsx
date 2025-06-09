'use client';

import { useState } from 'react';
import { Container, TextField, Box, Typography } from '@mui/material';
import YouTubeVideoGrid from '@/components/YouTubeVideoGrid';

export default function VideoSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Video Search
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search videos"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Enter search terms..."
        />
      </Box>

      {searchQuery && <YouTubeVideoGrid searchQuery={searchQuery} />}
    </Container>
  );
} 