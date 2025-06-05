'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Mic as MicIcon,
  Headphones as HeadphonesIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  MusicNote as MusicIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  source: 'telecast' | 'spotify';
  category?: string;
  tags?: string[];
  type: 'podcast' | 'video' | 'music' | 'movie' | 'book';
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const type = searchParams.get('type');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('podcasts');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set active tab based on URL parameter
  useEffect(() => {
    if (type) {
      const tabMap: { [key: string]: string } = {
        'podcast': 'podcasts',
        'video': 'videos', 
        'music': 'music',
        'book': 'books',
        'all': 'all'
      };
      setActiveTab(tabMap[type] || 'all');
    }
  }, [type]);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      // Use the type parameter directly instead of waiting for activeTab to update
      const searchType = type || 'all';
      handleSearchWithType(query, searchType);
    } else if (type) {
      // Load content for the category even without search query
      loadCategoryContent(type);
    }
  }, [query, type]);

  const loadCategoryContent = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      // Load popular/trending content for the category
      const response = await fetch(`/api/search?type=${category}&popular=true`);
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Category content error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchWithType = async (searchQuery: string, searchType: string) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('Searching for:', searchQuery, 'type:', searchType);
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      console.log('Search results:', data);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('Searching for:', searchQuery, 'type:', activeTab.slice(0, -1));
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${activeTab.slice(0, -1)}`);
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      console.log('Search results:', data);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Selected result:', result);
    switch (result.type) {
      case 'podcast':
        router.push(`/podcast/${result.id}`);
        break;
      case 'video':
        router.push(`/video/${result.id}`);
        break;
      case 'movie':
        router.push(`/movie/${result.id}`);
        break;
      case 'book':
        router.push(`/book/${result.id}`);
        break;
    }
  };

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'podcasts':
        return results.filter(result => result.type === 'podcast');
      case 'videos':
        return results.filter(result => result.type === 'video');
      case 'music':
        return results.filter(result => result.type === 'music');
      case 'movies':
        return results.filter(result => result.type === 'movie');
      case 'books':
        return results.filter(result => result.type === 'book');
      case 'all':
        return results; // Return all results without filtering
      default:
        return results;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'podcast':
        return <HeadphonesIcon />;
      case 'video':
        return <VideoIcon />;
      case 'music':
        return <MusicIcon />;
      case 'movie':
        return <VideoIcon />;
      case 'book':
        return <BookIcon />;
      default:
        return <SearchIcon />;
    }
  };

  if (!query && !type) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Enter a search query to find content
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  const filteredResults = getFilteredResults();

  // Determine the page title based on whether it's a search or category browse
  const getPageTitle = () => {
    if (query) {
      return `Search Results for "${query}"`;
    } else if (type) {
      const categoryNames: { [key: string]: string } = {
        'podcast': 'Podcasts',
        'video': 'Videos',
        'music': 'Music', 
        'book': 'Books',
        'all': 'All Content'
      };
      return `Browse ${categoryNames[type] || 'Content'}`;
    }
    return 'Search';
  };

  const getSubtitle = () => {
    if (query) {
      const contentType = activeTab === 'all' ? 'all content' : activeTab;
      return `Found ${filteredResults.length} results in ${contentType}`;
    } else {
      const contentType = activeTab === 'all' ? 'all content' : activeTab;
      return `Explore popular ${contentType}`;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getPageTitle()}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {getSubtitle()}
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <List sx={{ width: '100%' }}>
          {filteredResults.map((result, index) => (
            <React.Fragment key={`${result.source}-${result.id}`}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleResultClick(result)}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={result.imageUrl}
                    alt={result.title}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getIconForType(result.type)}
                      <Typography variant="h6" component="div">
                        {result.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {result.author}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {result.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {result.category && (
                          <Chip 
                            label={result.category} 
                            size="small"
                          />
                        )}
                        <Chip 
                          label={result.type} 
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </Box>
                  }
                />
                <IconButton
                  size="large"
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark',
                    },
                  }}
                >
                  <PlayIcon />
                </IconButton>
              </ListItem>
              {index < filteredResults.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {filteredResults.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No {activeTab} found
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default function Search() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    }>
      <SearchContent />
    </Suspense>
  );
} 