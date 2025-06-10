'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import UnifiedSearchResults from '@/components/UnifiedSearchResults';

interface SearchResult {
  id: string;
  type: 'podcast' | 'video' | 'music' | 'book';
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const showRecommendations = !query && ['podcast', 'video', 'music', 'book'].includes(type);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query && !showRecommendations) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query || 'recommended',
            types: type === 'all' ? ['all'] : [type],
            maxResults: 20,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch results');
        }

        // Ensure the results match the expected type
        const typedResults: SearchResult[] = (data.results || []).map((result: any) => ({
          ...result,
          type: result.type as 'podcast' | 'video' | 'music' | 'book'
        }));

        setResults(typedResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(fetchResults, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, type, showRecommendations]);

  if (!query && !showRecommendations) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            Enter a search term in the navigation bar to find content
          </Typography>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  const getRecommendationTitle = () => {
    switch (type) {
      case 'podcast':
        return 'Recommended Podcasts';
      case 'video':
        return 'Recommended Videos';
      case 'music':
        return 'Recommended Music';
      case 'book':
        return 'Recommended Books';
      default:
        return `Search Results for "${query}"`;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {query ? `Search Results for "${query}"` : getRecommendationTitle()}
      </Typography>
      <UnifiedSearchResults results={results} searchType={type} />
    </Container>
  );
} 