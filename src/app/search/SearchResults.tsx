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
      {/* CTA for podcast recording */}
      {type === 'podcast' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <a href="/record" style={{ textDecoration: 'none' }}>
            <Box
              component="button"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: '#ff9800',
                color: '#fff',
                px: 7,
                py: 3,
                borderRadius: 1,
                fontWeight: 900,
                fontSize: { xs: '1.5rem', sm: '1.9rem' },
                border: 'none',
                boxShadow: '0 6px 24px 0 rgba(255, 152, 0, 0.18)',
                cursor: 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
                letterSpacing: 1,
                mt: 2,
                mb: 1,
                '&:hover': {
                  background: '#fb8c00',
                  boxShadow: '0 10px 32px 0 rgba(255, 152, 0, 0.28)',
                  transform: 'translateY(-2px) scale(1.03)',
                },
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 17C14.7614 17 17 14.7614 17 12V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V12C7 14.7614 9.23858 17 12 17Z" fill="white"/><path d="M19 11.9999C19 16.4182 15.4183 19.9999 11 19.9999C6.58172 19.9999 3 16.4182 3 11.9999" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M12 22V20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              Make Your Own Podcast with Telecast
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Box>
          </a>
          <Box sx={{ textAlign: 'center', color: '#ff9800', fontWeight: 700, fontSize: 17, mt: 1, letterSpacing: 0.5, textShadow: '0 1px 8px rgba(255,152,0,0.08)' }}>
            No experience needed. One click to start!
          </Box>
        </Box>
      )}
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