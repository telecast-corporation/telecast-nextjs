'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import UnifiedSearchResults from '@/components/UnifiedSearchResults';
import BookTypeToggle from '@/components/BookTypeToggle';
import PartnerLogos from '@/components/PartnerLogos';

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
      {/* Partner Logos */}
      <PartnerLogos />
      
      {/* CTA for podcast recording */}
      {type === 'podcast' && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mb: 4,
          px: { xs: 2, sm: 0 }
        }}>
          <a href="/record" style={{ textDecoration: 'none', width: '100%', maxWidth: '500px' }}>
            <Box
              component="button"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1, sm: 2 },
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                color: '#fff',
                px: { xs: 3, sm: 6 },
                py: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                border: 'none',
                boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: { xs: 0.5, sm: 0.8 },
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s',
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #e55a2b 0%, #e8851a 100%)',
                  boxShadow: '0 12px 40px rgba(255, 107, 53, 0.4)',
                  transform: 'translateY(-3px)',
                  '&::before': {
                    left: '100%',
                  },
                },
                '&:active': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)',
                },
              }}
            >
              <svg 
                width={24} 
                height={24} 
                viewBox="0 0 24 24" 
                fill="none"
                style={{ 
                  minWidth: '24px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              >
                <path d="M12 17C14.7614 17 17 14.7614 17 12V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V12C7 14.7614 9.23858 17 12 17Z" fill="white"/>
                <path d="M19 11.9999C19 16.4182 15.4183 19.9999 11 19.9999C6.58172 19.9999 3 16.4182 3 11.9999" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 22V20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ 
                whiteSpace: 'nowrap',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <Box component="span" sx={{ 
                  display: { xs: 'inline', sm: 'none' }
                }}>
                  Create Podcast
                </Box>
                <Box component="span" sx={{ 
                  display: { xs: 'none', sm: 'inline' }
                }}>
                  Make Your Own Podcast
                </Box>
              </span>
              <svg 
                width={20} 
                height={20} 
                viewBox="0 0 24 24" 
                fill="none" 
                style={{ 
                  marginLeft: '8px',
                  minWidth: '20px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              >
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
          </a>
          <Box sx={{ 
            textAlign: 'center', 
            color: '#ff6b35', 
            fontWeight: 600, 
            fontSize: { xs: '0.875rem', sm: '1rem' }, 
            mt: 2, 
            letterSpacing: 0.3,
            textShadow: '0 1px 4px rgba(255,107,53,0.1)',
            opacity: 0.9
          }}>
            ✨ No experience needed • One click to start!
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