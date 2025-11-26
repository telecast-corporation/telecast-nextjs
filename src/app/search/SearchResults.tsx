'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, CircularProgress, TextField, useTheme, useMediaQuery } from '@mui/material';
import UnifiedSearchResults from '@/components/UnifiedSearchResults';
import BookTypeToggle from '@/components/BookTypeToggle';
import PartnerLogos from '@/components/PartnerLogos';
import Pagination from '@/components/Pagination';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/styles/typography';

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
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { isAuthenticated } = useAuth();
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showRecommendations = !query && ['podcast', 'video', 'music', 'book', 'news', 'tv'].includes(type);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query && !showRecommendations) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchTypes = type === 'all' ? ['all'] : type === 'book' ? [bookType] : [type];
        
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query || 'recommended',
            types: searchTypes,
            maxResults: 500,
            trending: showRecommendations,
            page: currentPage,
            limit: 20,
            city,
            country,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch results');
        }

        setResults(data.results || []);
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

    debounceTimerRef.current = setTimeout(fetchResults, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, type, bookType, showRecommendations, currentPage, city, country]);

  if (!query && !showRecommendations) {
    return (
      <Container maxWidth="lg" sx={{ py: spacing.section.md }}>
        <Box sx={{ textAlign: 'center', py: spacing.component.lg }}>
          <Typography variant="h5" color="text.secondary" sx={typography.heading}>
            Search for your favorite content.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: spacing.section.md }}>
        <Box sx={{ textAlign: 'center', py: spacing.component.lg }}>
          <Typography color="error" sx={typography.heading}>An error occurred while fetching results.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? spacing.section.xs : spacing.section.sm }}>
      {type === 'podcast' && (
        <Box sx={{ textAlign: 'center', mb: spacing.gap.md, px: isMobile ? spacing.component.xs : 0 }}>
          <a href={isAuthenticated ? "/my-podcasts" : "/auth/login"} style={{ textDecoration: 'none' }}>
            <Typography sx={{ ...typography.button, color: '#ff6b35', textDecoration: 'underline', '&:hover': { color: '#e55a2b' } }}>
              Create your own podcast ↗
            </Typography>
          </a>
          <Typography sx={{ ...typography.caption, color: '#ff6b35', opacity: 0.8, mt: 1 }}>
            ✨ No experience needed • One click to start!
          </Typography>
        </Box>
      )}
      
      <PartnerLogos />

      {query && (
        <Typography variant="h4" component="h1" gutterBottom sx={{ ...typography.title, mb: spacing.gap.md }}>
          Search Results for "{query}"
        </Typography>
      )}
      
      {type === 'book' && (
        <BookTypeToggle value={bookType} onChange={setBookType} />
      )}

      {type === 'news' && (
        <Box sx={{ display: 'flex', gap: 2, mb: spacing.gap.md, flexDirection: isMobile ? 'column' : 'row' }}>
          <TextField
            label="City"
            variant="outlined"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            fullWidth={isMobile}
          />
          <TextField
            label="Country"
            variant="outlined"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            fullWidth={isMobile}
          />
        </Box>
      )}
      
      <UnifiedSearchResults results={results} searchType={type} loading={loading} trending={showRecommendations} />
      
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
