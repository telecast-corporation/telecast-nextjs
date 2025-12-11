'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Typography, Box, CircularProgress, TextField, useTheme, useMediaQuery, Button, Modal, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import UnifiedSearchResults from '@/components/UnifiedSearchResults';
import BookTypeToggle from '@/components/BookTypeToggle';
import PartnerLogos from '@/components/PartnerLogos';
import Pagination from '@/components/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/styles/typography';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { countries } from '@/lib/countries';
import { Toast } from '@/components/Toast';

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
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookType, setBookType] = useState<'book' | 'audiobook'>('book');
  const [pagination, setPagination] = useState<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { isAuthenticated } = useAuth();
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [modalOpen, setModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  if (type === 'all') {
    router.push('/');
    return null;
  }

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
        const searchTypes = type === 'book' ? [bookType] : [type];
        
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

        if (data.results.length === 0 && query) {
          setToastMessage('No results found for your search.');
          setToastSeverity('info');
          setToastOpen(true);
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

  const handleApplyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (country) params.set('country', country);
    else params.delete('country')
    if (city) params.set('city', city);
    else params.delete('city')

    router.push(`/search?${params.toString()}`);
    setModalOpen(false);
  };

  const handleClear = () => {
    setCountry('');
    setCity('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('country');
    params.delete('city');
    router.push(`/search?${params.toString()}`);
    setModalOpen(false);
  };

  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  const cities = countries.find(c => c.name === country)?.cities || [];


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
      <Toast 
        open={toastOpen} 
        message={toastMessage} 
        onClose={() => setToastOpen(false)} 
        severity={toastSeverity} 
      />
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: spacing.gap.md }}>
        <Button
          variant="contained"
          startIcon={<FilterIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: '20px', textTransform: 'none' }}
        >
          All
        </Button>
        </Box>
      )}
      
       <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4 }}>
          <Typography variant="h6" gutterBottom>Filter News</Typography>
          <TextField
            label="Search Country"
            variant="outlined"
            fullWidth
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Country</InputLabel>
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              {filteredCountries.map((c) => (
                <MenuItem key={c.code} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth disabled={!country} sx={{ mb: 2 }}>
            <InputLabel>City</InputLabel>
            <Select value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((cityName) => (
                <MenuItem key={cityName} value={cityName}>
                  {cityName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleClear} variant="text">Clear</Button>
            <Button onClick={handleApplyFilter} variant="contained">Apply</Button>
          </Box>
        </Paper>
      </Modal>

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
