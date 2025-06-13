'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  InputBase,
  alpha,
  styled,
  useTheme,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  Container,
  Link as MuiLink,
  ListItemIcon,
  Drawer,
  useMediaQuery,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Podcasts as PodcastIcon,
  VideoLibrary as VideoIcon,
  MusicNote as MusicIcon,
  MenuBook as BookIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Login as LoginIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AllInclusive as AllIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Headphones as HeadphonesIcon,
  ArrowBack as ArrowBackIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useDebounce from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
import { Lexend } from 'next/font/google';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '700', '900'] });

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  fontFamily: lexend.style.fontFamily,
  color: theme.palette.text.primary,
  fontSize: '1.5rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  height: '60px',
  minWidth: '140px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  boxShadow: 'none',
  textTransform: 'none',
  transition: 'background 0.2s, color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
  marginLeft: theme.spacing(2),
  padding: theme.spacing(0, 2.5),
}));

const FilterButton = styled(Button)(({ theme }) => ({
  minWidth: '100px',
  borderLeft: `1px solid ${theme.palette.divider}`,
  borderRadius: '0 8px 8px 0',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface SearchResult {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  source: 'telecast' | 'spotify';
  category?: string;
  tags?: string[];
}

const MainNav = memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchResultsAnchorEl, setSearchResultsAnchorEl] = useState<null | HTMLElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, login, logout, isLoading: authLoading } = useAuth();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cachedSearchQuery, setCachedSearchQuery] = useState('');
  const [cachedSearchResults, setCachedSearchResults] = useState<SearchResult[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { isDarkMode, toggleDarkMode } = useAppTheme();

  // Add debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 100); // 100ms delay

  // Memoize filter options to prevent recreation on every render
  const filterOptions = [
    { value: 'All', icon: <SearchIcon /> },
    { value: 'Podcasts', icon: <HeadphonesIcon /> },
    { value: 'Videos', icon: <VideoIcon /> },
    { value: 'Music', icon: <MusicIcon /> },
    { value: 'Books', icon: <BookIcon /> }
  ];

  // Memoize callbacks to prevent unnecessary re-renders
  const performPreviewSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Convert filter to singular form for API consistency
      const typeMap: { [key: string]: string } = {
        'All': 'all',
        'Podcasts': 'podcast',
        'Videos': 'video',
        'Music': 'music',
        'Books': 'book'
      };
      const type = typeMap[selectedFilter];
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (err) {
      console.error('Preview search error:', err);
      setSearchResults([]);
    }
  }, [selectedFilter]);

  const handleSearchClose = useCallback(() => {
    setIsSearching(false);
  }, []);

  const submitSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    // Convert filter to singular form for API consistency
    const typeMap: { [key: string]: string } = {
      'All': 'all',
      'Podcasts': 'podcast',
      'Videos': 'video',
      'Music': 'music',
      'Books': 'book'
    };
    const type = typeMap[selectedFilter];
    const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}${type !== 'all' ? `&type=${type}` : ''}`;
    router.push(searchUrl);
    handleSearchClose();
  }, [searchQuery, selectedFilter, router, handleSearchClose]);

  const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  const handleFilterSelect = useCallback((filter: string) => {
    setSelectedFilter(filter);
    
    // If it's not "All", navigate to search page with the filter
    if (filter !== 'All') {
      // Convert to singular form for consistency, but handle 'Music' specially
      const filterType = filter === 'Music' ? 'music' : filter.toLowerCase().slice(0, -1);
      const searchUrl = `/search?type=${filterType}`;
      router.push(searchUrl);
      setIsSearching(false);
    } else {
      // If "All" is selected
      if (searchQuery) {
        // If there's a search query, perform search with all types
        performPreviewSearch(searchQuery);
      } else {
        // If no search query, navigate back to home page
        router.push('/');
        setIsSearching(false);
      }
    }
  }, [router, searchQuery, performPreviewSearch]);

  const handleSearch = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  }, [submitSearch]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      submitSearch();
    }
  }, [searchQuery, submitSearch]);

  const handleResultClick = useCallback((result: SearchResult) => {
    handleSearchClose();
    if (result.source === 'spotify') {
      // Preserve the current filter type when clicking Spotify results
      const filterParam = selectedFilter === 'All' ? '' : `&type=${selectedFilter.toLowerCase().slice(0, -1)}`;
      const searchUrl = `/search?q=${encodeURIComponent(result.title)}${filterParam}`;
      router.push(searchUrl);
    } else {
      const podcastUrl = `/podcast/${result.id}`;
      router.push(podcastUrl);
    }
  }, [router, handleSearchClose, selectedFilter]);

  const getIconForType = useCallback((source: string) => {
    switch (source) {
      case 'telecast':
        return <PodcastIcon />;
      case 'spotify':
        return <MusicIcon />;
      default:
        return <SearchIcon />;
    }
  }, []);

  const handleProfileMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  }, []);

  const handleProfileClose = useCallback(() => {
    setProfileAnchorEl(null);
  }, []);

  const handleProfileClick = useCallback(() => {
    setProfileAnchorEl(null);
    router.push('/profile');
  }, [router]);

  const handleSettingsClick = useCallback(() => {
    setProfileAnchorEl(null);
    router.push('/settings');
  }, [router]);

  const handleLogoutClick = useCallback(async () => {
    await logout();
    handleProfileClose();
  }, [logout, handleProfileClose]);

  // Effect to trigger preview search when debounced query changes (NO NAVIGATION)
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performPreviewSearch(debouncedSearchQuery);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, performPreviewSearch]);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Memoize search results rendering
  const renderSearchResults = useCallback(() => {
    if (!searchQuery) return null;

    return (
      <Paper 
        sx={{ 
          width: '100%', 
          maxWidth: 600,
          maxHeight: 400,
          overflow: 'auto',
          mt: 1,
          boxShadow: theme.shadows[4],
          zIndex: 1000,
        }}
      >
        {isLoading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>Searching...</Typography>
          </Box>
        ) : searchResults.length > 0 ? (
          <List>
            {searchResults.map((result, index) => (
              <React.Fragment key={`${result.source}-${result.id}`}>
                <ListItem 
                  button 
                  onClick={() => handleResultClick(result)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={result.imageUrl}>
                      {getIconForType(result.source)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={result.title} 
                    secondary={result.author} 
                  />
                </ListItem>
                {index < searchResults.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>No results found</Typography>
          </Box>
        )}
      </Paper>
    );
  }, [searchQuery, isLoading, searchResults, handleResultClick, getIconForType, theme.shadows]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    if (searchQuery) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${newValue}`);
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const handleBack = () => {
    router.back();
  };

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Videos', icon: <VideoIcon />, path: '/search?type=video' },
    { label: 'Podcasts', icon: <PodcastIcon />, path: '/search?type=podcast' },
    { label: 'Books', icon: <BookIcon />, path: '/search?type=book' },
    { label: 'Music', icon: <MusicIcon />, path: '/search?type=music' },
    { label: 'Services', icon: <SettingsIcon />, path: '/services' },
    { label: 'Contact', icon: <AllIcon />, path: '/contact' },
  ];

  const drawer = (
    <Box sx={{ width: { xs: '100%', sm: 280 } }} role="presentation">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: { xs: 1.5, sm: 2 },
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold',
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>Menu</Typography>
        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ p: { xs: 0.5, sm: 1 } }}>
          <CloseIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
        </IconButton>
      </Box>

      {/* Mobile Navigation */}
      <List sx={{ px: 0 }}>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.label} 
            onClick={() => handleNavigation(item.path)}
            sx={{
              py: { xs: 1, sm: 1.5 },
              '&:hover': {
                bgcolor: 'action.hover',
              },
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              },
            }}
            selected={pathname === item.path}
          >
            <ListItemIcon sx={{ 
              minWidth: { xs: 36, sm: 40 },
              color: 'inherit'
            }}>
              {React.cloneElement(item.icon, { 
                sx: { fontSize: { xs: '1.2rem', sm: '1.5rem' } }
              })}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{ 
                fontWeight: pathname === item.path ? 600 : 400,
                color: pathname === item.path ? 'primary.main' : 'text.primary',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }} 
            />
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Mobile Auth Section */}
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        {isAuthenticated ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
              <Avatar 
                alt={user?.name} 
                src={user?.image} 
                sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <List>
              {[
                { icon: <AccountIcon />, text: 'Profile', onClick: handleProfileClick },
                { icon: <SettingsIcon />, text: 'Settings', onClick: handleSettingsClick },
                { icon: <LogoutIcon />, text: 'Logout', onClick: handleLogoutClick }
              ].map((item) => (
                <ListItem 
                  button 
                  key={item.text} 
                  onClick={item.onClick}
                  sx={{ py: { xs: 0.75, sm: 1 } }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                    {React.cloneElement(item.icon, { 
                      sx: { fontSize: { xs: '1.2rem', sm: '1.5rem' } }
                    })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : null}
      </Box>

      {/* New ListItem for theme toggle inside the drawer, above the auth section */}
      <ListItem button onClick={toggleDarkMode} sx={{ py: { xs: 1, sm: 1.5 } }}>
        <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
          {isDarkMode ? <LightModeIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} /> : <DarkModeIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
        </ListItemIcon>
        <ListItemText 
          primary={isDarkMode ? 'Light Mode' : 'Dark Mode'} 
          primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} 
          />
      </ListItem>
    </Box>
  );

  // Don't render the navbar until auth state is determined
  if (authLoading) {
    return (
      <AppBar 
        position="fixed" 
        color="default" 
        elevation={0}
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: 'auto',
        }}
      >
        <Toolbar sx={{ 
          minHeight: '64px !important',
          py: 2,
          px: { xs: 2, sm: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
        }}>
          {/* Loading skeleton that maintains layout */}
          <Box sx={{ width: '240px', height: '50px', bgcolor: 'action.hover', borderRadius: 1, opacity: 0.3 }} />
          <Box sx={{ flexGrow: 1, mx: 2, height: '80px', bgcolor: 'action.hover', borderRadius: 1, opacity: 0.3 }} />
          <Box sx={{ width: '200px', height: '50px', bgcolor: 'action.hover', borderRadius: 1, opacity: 0.3 }} />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: '56px', sm: '64px' },
        py: { xs: 1, sm: 2 },
        px: { xs: 1, sm: 2, md: 4 },
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {/* Mobile Layout */}
          {isMobile ? (
            <>
              {/* Top Row - Logo, Theme Toggle, Profile */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
                <Link href="/" passHref style={{ textDecoration: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, minWidth: { xs: '100px', sm: '140px', md: '160px' }, maxWidth: { xs: '140px', sm: '180px', md: '200px' } }}>
                    <Image
                      src="/telecast-logo.gif"
                      alt="Telecast Logo"
                      width={500}
                      height={500}
                      style={{ 
                        width: '100%',
                        height: 'auto',
                        maxWidth: '500px',
                        maxHeight: '160px',
                        objectFit: 'contain',
                      }}
                      priority
                    />
                  </Box>
                </Link>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isAuthenticated ? (
                    <IconButton onClick={handleProfileMenuClick} size="small">
                      <Avatar alt={user?.name} src={user?.image} sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }} />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={login}
                      disabled={authLoading}
                      sx={{
                        bgcolor: 'background.paper',
                        color: 'primary.main',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        boxShadow: 1,
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                        },
                        borderRadius: '50%',
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        p: 0,
                        transition: 'all 0.2s',
                      }}
                      aria-label="Sign in"
                    >
                      <AccountCircleIcon sx={{ width: '70%', height: '70%' }} />
                    </IconButton>
                  )}
                  <IconButton 
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{ 
                      color: 'text.primary',
                      bgcolor: 'background.default',
                      border: `1px solid ${theme.palette.divider}`,
                      p: { xs: 0.5, sm: 1 },
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                    aria-label="Open menu"
                  >
                    <MenuIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </IconButton>
                </Box>
              </Box>
              {/* Bottom Row - Search & Menu */}
              <Box sx={{ width: '100%' }}>
                <Box 
                  ref={searchBoxRef}
                  component="form" 
                  onSubmit={handleSearch}
                  sx={{ 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: { xs: 1, sm: 1.5 }
                  }}
                >
                  <Box sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    flexGrow: 2,
                    maxWidth: { xs: '100%', sm: '420px' },
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}>
                    <IconButton type="submit" size="small" sx={{ p: { xs: 0.5, sm: 1 } }}>
                      <SearchIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    </IconButton>
                    <InputBase
                      name="search"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleKeyPress}
                      sx={{ 
                        flexGrow: 1, 
                        px: 1, 
                        '& input': { 
                          py: 0.5,
                          fontSize: { xs: '0.95rem', sm: '1rem' }
                        } 
                      }}
                    />
                  </Box>
                  {isMobile && (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{
                        ml: 1,
                        minWidth: 0,
                        px: 2,
                        py: 1,
                        fontSize: '0.95rem',
                        borderRadius: 2,
                        boxShadow: 1,
                        textTransform: 'none',
                        display: { xs: 'none', md: 'inline-flex' },
                        height: { xs: 36, sm: 40 },
                        alignSelf: 'stretch',
                      }}
                      disabled={authLoading}
                    >
                      Search
                    </Button>
                  )}
                  {/* Mobile Search Results */}
                  {isSearching && (
                    <Box sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: theme.zIndex.appBar + 1,
                      mt: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: 3,
                      maxHeight: '80vh',
                      overflow: 'auto',
                    }}>
                      {renderSearchResults()}
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          ) : (
            <>
              {/* Desktop Layout */}
              {/* Left section - Logo */}
              <Link href="/" passHref style={{ textDecoration: 'none' }}>
                <Box
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    mr: { xs: 2, md: 4 },
                    flexShrink: 0,
                    minWidth: { xs: '160px', sm: '220px', md: '300px', lg: '400px' },
                    maxWidth: { xs: '200px', sm: '300px', md: '400px', lg: '500px' },
                  }}
                >
                  <Image
                    src="/telecast-logo.gif"
                    alt="Telecast Logo"
                    width={500}
                    height={500}
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      maxWidth: '500px',
                      maxHeight: '160px',
                      objectFit: 'contain',
                    }}
                    priority
                  />
                </Box>
              </Link>

              {/* Center section - Search */}
              <Box 
                ref={searchBoxRef}
                component="form" 
                onSubmit={handleSearch}
                sx={{ 
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  maxWidth: '800px',
                  px: { md: 1, lg: 2 },
                  position: 'relative',
                }}
              >
                <Box sx={{ 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                }}>
                  <Box sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                    },
                    transition: 'border-color 0.2s',
                    position: 'relative',
                    width: '100%',
                    maxWidth: '600px',
                  }}>
                    <IconButton 
                      type="submit" 
                      sx={{ 
                        p: 1,
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                    <InputBase
                      name="search"
                      placeholder="Search podcasts, videos, music..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleKeyPress}
                      sx={{ 
                        flexGrow: 1,
                        px: 1,
                        '& input': {
                          py: 1,
                        }
                      }}
                    />
                  </Box>

                  {/* Desktop Search Results */}
                  {isSearching && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: theme.zIndex.appBar + 1,
                        mt: 1,
                        width: '100%',
                        maxWidth: '600px',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {renderSearchResults()}
                    </Box>
                  )}

                  {/* Desktop Filter Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    width: '100%',
                    pb: 1,
                    maxWidth: '600px',
                  }}>
                    {filterOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={selectedFilter === option.value ? "contained" : "outlined"}
                        size="small"
                        startIcon={option.icon}
                        onClick={() => handleFilterSelect(option.value)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          minWidth: isTablet ? '80px' : '100px',
                          ...(selectedFilter === option.value && {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            }
                          })
                        }}
                      >
                        {option.value}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Right section - Navigation and Auth */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { md: 1, lg: 2 },
                ml: { md: 1, lg: 2 },
                flexShrink: 0,
                minWidth: { md: '150px', lg: '200px' },
                justifyContent: 'flex-end',
              }}>
                {/* Desktop Navigation Links */}
                <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1 }}>
                  {isAuthenticated && (
                    <Link href="/dashboard" passHref style={{ textDecoration: 'none' }}>
                      <NavButton sx={{ fontSize: '1rem', height: '40px', minWidth: '80px' }}>
                        Dashboard
                      </NavButton>
                    </Link>
                  )}
                  <Link href="/about" passHref style={{ textDecoration: 'none' }}>
                    <NavButton sx={{ fontSize: '1rem', height: '40px', minWidth: '60px' }}>
                      About
                    </NavButton>
                  </Link>
                  <Link href="/services" passHref style={{ textDecoration: 'none' }}>
                    <NavButton sx={{ fontSize: '1rem', height: '40px', minWidth: '70px' }}>
                      Services
                    </NavButton>
                  </Link>
                  <Link href="/contact" passHref style={{ textDecoration: 'none' }}>
                    <NavButton sx={{ fontSize: '1rem', height: '40px', minWidth: '60px' }}>
                      Contact
                    </NavButton>
                  </Link>
                </Box>

                <Box sx={{ flexGrow: 0 }}>
                  {isAuthenticated ? (
                      <IconButton
                        onClick={handleProfileMenuClick}
                        sx={{ p: 0 }}
                        aria-label="profile menu"
                      >
                        <Avatar alt={user?.name} src={user?.image} />
                      </IconButton>
                  ) : (
                    <IconButton
                      onClick={login}
                      disabled={authLoading}
                      sx={{
                        bgcolor: 'background.paper',
                        color: 'primary.main',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        boxShadow: 1,
                        '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        },
                        borderRadius: '50%',
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        p: 0,
                        transition: 'all 0.2s',
                      }}
                      aria-label="Sign in"
                    >
                      <AccountCircleIcon sx={{ width: '70%', height: '70%' }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
            }
          }}
        >
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <AccountIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogoutClick}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>

        {/* Mobile Drawer Menu */}
        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          PaperProps={{
            sx: {
              width: 280,
              bgcolor: 'background.paper',
            }
          }}
        >
          {drawer}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
});

export default MainNav; 