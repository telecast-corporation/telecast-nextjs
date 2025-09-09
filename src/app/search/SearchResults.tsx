'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';
import UnifiedSearchResults from '@/components/UnifiedSearchResults';
import BookTypeToggle from '@/components/BookTypeToggle';
import PartnerLogos from '@/components/PartnerLogos';
import Pagination from '@/components/Pagination';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';


interface SearchResult {
  id: string;
  type: 'podcast' | 'video' | 'music' | 'book' | 'audiobook' | 'news' | 'tv';
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
  const [pagination, setPagination] = useState<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const showRecommendations = !query && ['podcast', 'video', 'music', 'book', 'news', 'tv'].includes(type);
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    const fetchResults = async () => {
      console.log('🔍 SearchResults fetchResults called:', { query, type, showRecommendations });
      
      // Always search if we have a query, regardless of showRecommendations
      if (!query && !showRecommendations) {
        console.log('🔍 No query and no recommendations, returning empty results');
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
        
        console.log('🔍 Search types determined:', searchTypes);

        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query || 'recommended',
            types: searchTypes,
            maxResults: type === 'news' ? 500 : 300,
            trending: showRecommendations,
            page: currentPage,
            limit: type === 'news' ? 50 : 20,
          }),
        });

        const data = await response.json();
        console.log('🔍 API response:', { status: response.status, resultsCount: data.results?.length, data });

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch results');
        }

        // Ensure the results match the expected type
        const typedResults: SearchResult[] = (data.results || []).map((result: any) => ({
          ...result,
          type: result.type as 'podcast' | 'video' | 'music' | 'book' | 'audiobook' | 'news' | 'tv'
        }));

        console.log('🔍 Typed results:', typedResults);
        setResults(typedResults);
        setPagination(data.pagination);
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
      setPagination(null); // Reset pagination when search changes
    }

    debounceTimerRef.current = setTimeout(fetchResults, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, type, bookType, showRecommendations, currentPage]);

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
      case 'tv':
        return 'Recommended TV Shows';
      default:
        return `Search Results for "${query}"`;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 1.5 } }}>
      {/* CTA for podcast recording */}
      {type === 'podcast' && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mb: 2,
          px: { xs: 2, sm: 0 }
        }}>
            <a 
            href={isAuthenticated ? "/my-podcasts" : "/auth/login"} 
            style={{ textDecoration: 'none' }}
          >

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                color: '#ff6b35',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                textDecorationThickness: '2px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#e55a2b',
                  transform: 'translateY(-1px)',
                  '& span:last-child': {
                    transform: 'translateX(2px)',
                  },
                },
              }}
            >
              <span>Create your own podcast</span>
              <span style={{ 
                fontSize: '0.9em',
                display: 'inline-block',
                marginLeft: '6px',
                color: '#e55a2b',
                fontWeight: 'bold',
                transition: 'transform 0.2s ease'
              }}>
                ↗
              </span>
            </Box>
          </a>
          <Box sx={{ 
            textAlign: 'center', 
            color: '#ff6b35', 
            fontWeight: 500, 
            fontSize: { xs: '0.8rem', sm: '0.9rem' }, 
            mt: 1, 
            letterSpacing: 0.2,
            opacity: 0.8
          }}>
            ✨ No experience needed • One click to start!
          </Box>
        </Box>
      )}
      
      {/* Partner Logos */}
      <PartnerLogos />
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
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !loading && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          showingSummary={{
            start: pagination.startIndex,
            end: pagination.endIndex,
            total: pagination.total,
          }}
        />
      )}
    </Container>
  );
} 