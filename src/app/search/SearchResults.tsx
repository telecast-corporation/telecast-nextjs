'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import UnifiedSearchResults from '@/components/UnifiedSearchResults';
import BookTypeToggle from '@/components/BookTypeToggle';

interface SearchResult {
  id: string;
  type: 'podcast' | 'video' | 'music' | 'book' | 'audiobook';
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
  const [bookType, setBookType] = useState<'books' | 'audiobooks'>('books');
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const showRecommendations = !query && ['podcast', 'video', 'music', 'book'].includes(type);

  useEffect(() => {
    const fetchResults = async () => {
      // Always search if we have a query, regardless of showRecommendations
      if (!query && !showRecommendations) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        // Determine search types based on the main type and book type
        let searchTypes: string[] = [];
        
        if (type === 'all') {
          searchTypes = ['all'];
        } else if (type === 'book') {
          // Handle book type toggle
          if (bookType === 'books') {
            searchTypes = ['book'];
          } else if (bookType === 'audiobooks') {
            searchTypes = ['audiobook'];
          }
        } else {
          searchTypes = [type];
        }

        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query || 'recommended',
            types: searchTypes,
            maxResults: 100,
            trending: showRecommendations,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch results');
        }

        // Ensure the results match the expected type
        const typedResults: SearchResult[] = (data.results || []).map((result: any) => ({
          ...result,
          type: result.type as 'podcast' | 'video' | 'music' | 'book' | 'audiobook'
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

    // Set loading immediately when query changes or when we should show recommendations
    if (query || showRecommendations) {
      setLoading(true);
      setError(null);
    }

    debounceTimerRef.current = setTimeout(fetchResults, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, type, bookType, showRecommendations]);

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
      {query && (
        <Typography variant="h4" component="h1" gutterBottom>
          Search Results for "{query}"
        </Typography>
      )}
      
      {/* Show book type toggle when searching for books */}
      {type === 'book' && (
        <BookTypeToggle value={bookType} onChange={setBookType} />
      )}
      
      <UnifiedSearchResults results={results} searchType={type} loading={loading} trending={showRecommendations} />
    </Container>
  );
} 