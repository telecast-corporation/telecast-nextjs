'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  InputBase,
  Input,
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
  Tooltip,
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
  Build as BuildIcon,
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Create as CreateIcon,
  Mic as MicIcon,
  AttachMoney as AttachMoneyIcon,
  Article as NewsIcon,
  LiveTv as StreamingIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useDebounce from '@/hooks/useDebounce';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius, navbarSizing } from '@/styles/typography';
import { Lexend } from 'next/font/google';
import { Search } from 'lucide-react';


const lexend = Lexend({ subsets: ['latin'], weight: ['400', '700', '900'] });

const SearchWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  '& .MuiInputBase-root': {
    width: '100%',
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:before, &:after': {
      display: 'none',
    },
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  zIndex: 1,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.primary.main,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3)})`, // Reduced to match icon wrapper padding
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  fontFamily: lexend.style.fontFamily,
  color: theme.palette.primary.main,
  fontSize: '1.1vw',
  fontWeight: 700,
  letterSpacing: '0.04em',
  height: '60px',
  minWidth: '100px',
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
    color: theme.palette.primary.dark,
  },
  marginLeft: theme.spacing(2),
  padding: theme.spacing(0, 2.5),
}));

const FilterButton = styled(Button)(({ theme }) => ({
  '&.MuiButton-root': {
    color: theme.palette.primary.main,
  },
  '&.MuiButton-text': {
    color: theme.palette.primary.main,
  },
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&.MuiButton-outlined': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      borderColor: theme.palette.primary.dark,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
}));

// Shared navigation button styles
const getNavButtonStyles = (theme: any, pathname: string, targetPath: string, isAuthenticated?: boolean) => ({
  fontFamily: lexend.style.fontFamily,
  color: pathname === targetPath ? theme.palette.primary.main : theme.palette.text.primary,
  ...typography.nav,
  textTransform: 'none',
  borderRadius: 2,
  px: { xs: 1, sm: 1.5 },
  py: 0.5,
  minWidth: 0,
  fontSize: { xs: '0.92rem', sm: '1rem' },
  backgroundColor: pathname === targetPath ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  border: pathname === targetPath ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
  transition: 'all 0.2s ease-in-out',
  marginLeft: { xs: 0.5, sm: 1 },
  marginRight: { xs: 0.5, sm: 1 },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
});

// Shared filter button styles
const getFilterButtonStyles = (theme: any, selectedFilter: string, filterName: string) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: {
    xs: theme.spacing(1, 2), // More padding on mobile
    sm: theme.spacing(1, 2),
    md: theme.spacing(1.5, 3),
  },
  minWidth: {
    xs: '70px', // Wider minWidth on mobile
    sm: 'auto',
  },
  backgroundColor: selectedFilter === filterName ? theme.palette.primary.main : 'transparent',
  color: selectedFilter === filterName ? theme.palette.primary.contrastText : theme.palette.primary.main,
  fontFamily: lexend.style.fontFamily,
  ...typography.nav,
  fontSize: {
    xs: '0.85rem', // Slightly smaller text on mobile
    sm: '0.95rem',
    md: typography.nav.fontSize,
  },
  minHeight: {
    xs: '2.2rem',
    sm: '2.5rem',
    md: '3rem',
  },
  flex: {
    xs: '1 1 auto',
    sm: '0 0 auto',
  },
  maxWidth: {
    xs: 'none',
    sm: 'none',
  },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '& .MuiButton-startIcon': {
    marginRight: {
      xs: theme.spacing(0.25),
      sm: theme.spacing(0.5),
      md: theme.spacing(1),
    },
    '& > svg': {
      fontSize: {
        xs: '1rem',
        sm: '1.25rem',
        md: '1.5rem',
      },
    },
  },
  '& .MuiButton-root': {
    minWidth: 0,
  },
  '&:hover': {
    backgroundColor: selectedFilter === filterName ? theme.palette.primary.dark : theme.palette.action.hover,
  },
});

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

const GridNav = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(8),
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  width: '100%',
  zIndex: theme.zIndex.appBar,
  boxShadow: theme.shadows[1],
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(6),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1),
    marginBottom: theme.spacing(4),
  },
}));

// Top row container for logo, search, and navigation
const TopRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '60px',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('lg')]: {
    height: '50px',
    marginBottom: theme.spacing(0.5),
  },
  [theme.breakpoints.down('sm')]: {
    height: '45px',
    marginBottom: theme.spacing(0.5),
  },
}));

// Bottom row container for filters
const BottomRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '50px',
  [theme.breakpoints.down('lg')]: {
    height: '40px',
    justifyContent: 'flex-start',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  [theme.breakpoints.down('sm')]: {
    height: '35px',
  },
}));

const LogoArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  height: '100%',
  width: 'auto',
  minWidth: '200px',
  '& img': {
    maxHeight: '50px',
    maxWidth: '200px',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
  [theme.breakpoints.down('lg')]: {
    minWidth: '150px',
    '& img': {
      maxHeight: '40px',
      maxWidth: '150px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '120px',
    '& img': {
      maxHeight: '35px',
      maxWidth: '120px',
    },
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '500px',
  height: '40px',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.primary.main}`,
  margin: '0 auto',
  '& .search-icon': {
    padding: '0 0.75rem',
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  '& .MuiInputBase-root': {
    height: '100%',
    fontSize: '0.9rem',
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
  },
  '& .MuiInputBase-input': {
    padding: '0.5rem 0.25rem',
    textAlign: 'left',
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '100%',
    height: '36px',
    '& .MuiInputBase-root': {
      fontSize: '0.85rem',
    },
    '& .search-icon': {
      padding: '0 0.5rem',
    },
  },
  [theme.breakpoints.down('sm')]: {
    height: '32px',
    '& .MuiInputBase-root': {
      fontSize: '0.8rem',
    },
    '& .search-icon': {
      padding: '0 0.4rem',
    },
  },
}));

const SearchInput = styled(Input)(({ theme }) => ({
  width: '100%',
  '& .MuiInputBase-root': {
    width: '100%',
    textAlign: 'center',
  },
  '& .MuiInputBase-input': {
    textAlign: 'center',
  },
  '&:before, &:after': {
    display: 'none', // Remove underline
  },
  '&:hover:not(.Mui-disabled):before': {
    display: 'none', // Remove underline on hover
  },
}));

const FiltersArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  width: '100%',
  height: '100%',
  '& .MuiButton-root': {
    minHeight: '32px',
    height: '32px',
    padding: theme.spacing(0.5, 1.5),
    fontSize: '0.8rem',
    minWidth: 'auto',
    borderRadius: theme.shape.borderRadius,
    fontWeight: 500,
    transition: 'all 0.2s ease-in-out',
    flex: '0 0 auto',
  },
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'flex-start',
    gap: theme.spacing(0.5),
    flexWrap: 'nowrap',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '& .MuiButton-root': {
      minHeight: '28px',
      height: '28px',
      fontSize: '0.75rem',
      padding: theme.spacing(0.4, 1),
      minWidth: '80px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'flex-start',
    gap: theme.spacing(0.25),
    flexWrap: 'nowrap',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '& .MuiButton-root': {
      minHeight: '26px',
      height: '26px',
      fontSize: '0.7rem',
      padding: theme.spacing(0.3, 0.8),
      minWidth: '70px',
    },
  },
}));



// Add hamburger menu area
const HamburgerArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  height: '100%',
  width: 'auto',
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
  [theme.breakpoints.down('lg')]: {
    display: 'flex',
  },
}));

// Add a new breakpoint for NavButtonBox to show only two buttons on md and below
const NavButtonBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& > *:nth-of-type(n+3)': {
    display: 'none',
  },
  [theme.breakpoints.up('lg')]: {
    '& > *': {
      display: 'flex',
    },
  },
  [theme.breakpoints.down('md')]: {
    '& > *:nth-of-type(n+3)': {
      display: 'none',
    },
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const MobileLoginButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

// New NavGroup component that contains all navigation buttons
const NavGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: '100%',
  width: 'auto',
  gap: theme.spacing(1),
  '& .nav-button': {
    flex: '0 0 auto',
    minHeight: '36px',
    height: '36px',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: theme.spacing(0.5, 1),
    minWidth: 'auto',
    maxWidth: 'none',
    whiteSpace: 'nowrap',
    borderRadius: theme.shape.borderRadius,
    border: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      border: 'none',
    },
  },
  '& .theme-button': {
    flex: '0 0 auto',
    width: '36px',
    height: '36px',
    padding: theme.spacing(0.5),
    minWidth: '36px',
    maxWidth: '36px',
    borderRadius: '50%',
    border: 'none',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      border: 'none',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
    },
  },
  '& .MuiAvatar-root': {
    width: 36,
    height: 36,
    fontSize: '1rem',
  },
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const MainNav = memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, login, logout, isLoading: authLoading } = useAuth();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');


  // Convert filter to API type
  const getApiType = (filter: string) => {
    const typeMap: { [key: string]: string } = {
      'All': 'all',
      'Podcasts': 'podcast',
      'Videos': 'video',
      'Music': 'music',
      'Books': 'book',
      'News': 'news',
      'Streaming': 'tv'
    };
    return typeMap[filter] || 'all';
  };

  // Use the new autocomplete hook
  const {
    suggestions,
    isLoading: isAutocompleteLoading,
    selectedIndex,
    isOpen: isAutocompleteOpen,
    setIsOpen: setAutocompleteOpen,
    handleKeyDown: handleAutocompleteKeyDown,
    handleSuggestionClick,
    clearSuggestions,
  } = useAutocomplete(searchQuery, getApiType(selectedFilter), {
    minLength: 2,
    debounceMs: 300,
    maxResults: 8,
  });

  // Memoize filter options to prevent recreation on every render
  const filterOptions = [
    { value: 'All', icon: <SearchIcon /> },
    { value: 'Podcasts', icon: <HeadphonesIcon /> },
    { value: 'Videos', icon: <VideoIcon /> },
    { value: 'Streaming', icon: <StreamingIcon /> },
    { value: 'Music', icon: <MusicIcon /> },
    { value: 'Books', icon: <BookIcon /> },
    { value: 'News', icon: <NewsIcon /> }
  ];

  // Handle autocomplete suggestion selection
  const handleAutocompleteSelect = useCallback((suggestion: any) => {
    if (suggestion.url?.startsWith('/')) {
      // Internal URL - navigate directly
      router.push(suggestion.url);
    } else {
      // External URL or search - perform search
      setSearchQuery(suggestion.title);
      const type = getApiType(selectedFilter);
      const searchUrl = `/search?q=${encodeURIComponent(suggestion.title)}${type !== 'all' ? `&type=${type}` : ''}`;
      router.push(searchUrl);
    }
    clearSuggestions();
  }, [router, selectedFilter, clearSuggestions, getApiType]);

  const submitSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    const type = getApiType(selectedFilter);
    const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}${type !== 'all' ? `&type=${type}` : ''}`;
    router.push(searchUrl);
    clearSuggestions();
  }, [searchQuery, selectedFilter, router, clearSuggestions, getApiType]);

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
      const filterType = getApiType(filter);
      const searchUrl = `/search?type=${filterType}`;
      router.push(searchUrl);
      setAutocompleteOpen(false);
    } else {
      // If "All" is selected and no search query, navigate back to home page
      if (!searchQuery) {
        router.push('/');
        setAutocompleteOpen(false);
      }
    }
  }, [router, searchQuery, getApiType, setAutocompleteOpen]);

  const handleSearch = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  }, [submitSearch]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // First, let the autocomplete handle the key press
    const handled = handleAutocompleteKeyDown(e);
    
    if (!handled && e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      submitSearch();
    }
  }, [searchQuery, submitSearch, handleAutocompleteKeyDown]);

  const getIconForType = useCallback((type: string) => {
    switch (type) {
      case 'podcast':
        return <PodcastIcon />;
      case 'video':
        return <VideoIcon />;
      case 'tv':
        return <StreamingIcon />;
      case 'music':
        return <MusicIcon />;
      case 'book':
        return <BookIcon />;
      case 'news':
        return <NewsIcon />;
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



  // Add click outside handler for autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setAutocompleteOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setAutocompleteOpen]);

  // Memoize autocomplete results rendering
  const renderAutocompleteResults = useCallback(() => {
    if (!isAutocompleteOpen || !searchQuery) return null;

    return (
      <Paper 
        sx={{ 
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: 400,
          overflow: 'auto',
          mt: 0.5,
          boxShadow: theme.shadows[8],
          zIndex: 1300,
          borderRadius: 2,
        }}
      >
        {isAutocompleteLoading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Searching...
            </Typography>
          </Box>
        ) : suggestions.length > 0 ? (
          <List sx={{ py: 0 }}>
            {suggestions.map((suggestion, index) => (
              <ListItem 
                key={`${suggestion.type}-${suggestion.id}`}
                button 
                selected={index === selectedIndex}
                onClick={() => {
                  handleSuggestionClick(suggestion);
                  handleAutocompleteSelect(suggestion);
                }}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={suggestion.thumbnail} 
                    sx={{ width: 32, height: 32 }}
                  >
                    {getIconForType(suggestion.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Typography variant="body2" component="div" noWrap>
                      {suggestion.title}
                    </Typography>
                  }
                  secondary={
                    suggestion.author && (
                      <Typography variant="body2" component="span" color="text.secondary" noWrap>
                        {suggestion.author}
                      </Typography>
                    )
                  }
                />
                <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                  {getIconForType(suggestion.type)}
                </ListItemIcon>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No suggestions found
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }, [
    isAutocompleteOpen,
    searchQuery,
    isAutocompleteLoading,
    suggestions,
    selectedIndex,
    handleSuggestionClick,
    handleAutocompleteSelect,
    getIconForType,
    theme.shadows
  ]);

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
          fontFamily: lexend.style.fontFamily,
          fontWeight: 700,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>Menu</Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ p: { xs: 0.5, sm: 1 } }}>
          <CloseIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
        </IconButton>
      </Box>

      {/* Mobile Navigation - Vertical Stack */}
      <List sx={{ px: 2, py: 1 }}>
        <ListItem button onClick={() => { handleDrawerToggle(); router.push('/'); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Home" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              ...typography.nav
            }} 
          />
        </ListItem>
        
        <ListItem button onClick={() => { handleDrawerToggle(); router.push('/about'); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText 
            primary="About" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              ...typography.nav
            }} 
          />
        </ListItem>
        
        <ListItem button onClick={() => { handleDrawerToggle(); router.push('/services'); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Services" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              ...typography.nav
            }} 
          />
        </ListItem>
        
        <ListItem button onClick={() => { handleDrawerToggle(); router.push('/contact'); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Contact" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              ...typography.nav
            }} 
          />
        </ListItem>
        
        <ListItem button onClick={() => { handleDrawerToggle(); router.push('/faq'); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText 
            primary="FAQ" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              ...typography.nav
            }} 
          />
        </ListItem>
        
        <ListItem button onClick={() => { handleDrawerToggle(); router.push('/pricing'); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AttachMoneyIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Pricing" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              ...typography.nav
            }} 
          />
        </ListItem>
        
                  {isAuthenticated && (
                            <ListItem button onClick={() => { handleDrawerToggle(); router.push('/my-podcasts'); }} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CreateIcon />
              </ListItemIcon>
              <ListItemText 
                                  primary="Create" 
                primaryTypographyProps={{ 
                  fontFamily: lexend.style.fontFamily,
                  ...typography.nav
                }} 
              />
            </ListItem>
          )}
          
          {isAuthenticated && (
            <ListItem button onClick={() => { handleDrawerToggle(); router.push('/settings'); }} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Settings" 
                primaryTypographyProps={{ 
                  fontFamily: lexend.style.fontFamily,
                  ...typography.nav
                }} 
              />
            </ListItem>
          )}
        
        <Divider sx={{ my: 1 }} />
        

      </List>
    </Box>
  );

  // Don't render the navbar until auth state is determined
  if (authLoading) {
    return (
      <GridNav>
        <LogoArea>
          <Box sx={{ width: '240px', height: '50px', bgcolor: 'action.hover', borderRadius: 1, opacity: 0.3 }} />
        </LogoArea>
        <SearchContainer>
          <Box sx={{ flexGrow: 1, mx: 2, height: '80px', bgcolor: 'action.hover', borderRadius: 1, opacity: 0.3 }} />
        </SearchContainer>
        <FiltersArea>
          <Box sx={{ width: '200px', height: '50px', bgcolor: 'action.hover', borderRadius: 1, opacity: 0.3 }} />
        </FiltersArea>
      </GridNav>
    );
  }

  return (
    <>
      <GridNav>
        {/* Top Row: Logo, Search, Navigation */}
        <TopRow>
          <LogoArea>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Image
                src="/telecast-logo.gif"
                alt="Telecast Logo"
                width={200}
                height={50}
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '200px',
                  maxHeight: '50px',
                  objectFit: 'contain',
                }}
                sizes="(max-width: 600px) 120px, (max-width: 900px) 150px, 200px"
              />
            </Link>
          </LogoArea>

          <SearchContainer ref={searchBoxRef}>
            <Box className="search-icon">
              <SearchIcon />
            </Box>
            <SearchInput
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => searchQuery.length >= 2 && setAutocompleteOpen(true)}
            />
            {renderAutocompleteResults()}
          </SearchContainer>

          <NavGroup>
            <Button 
              variant="text"
              className="nav-button"
              onClick={() => router.push('/about')}
              sx={getNavButtonStyles(theme, pathname, '/about')}
            >
              About
            </Button>

            <Button
              variant="text"
              className="nav-button"
              onClick={() => router.push('/services')}
              sx={getNavButtonStyles(theme, pathname, '/services')}
            >
              Services
            </Button>

            <Button 
              variant="text"
              className="nav-button"
              onClick={() => router.push('/contact')}
              sx={getNavButtonStyles(theme, pathname, '/contact')}
            >
              Contact
            </Button>

            <Button 
              variant="text"
              className="nav-button"
              onClick={() => router.push('/pricing')}
              sx={getNavButtonStyles(theme, pathname, '/pricing')}
            >
              Pricing
            </Button>
            {isAuthenticated && (
              <Button 
                variant="text"
                className="nav-button"
                onClick={() => router.push('/my-podcasts')}
                sx={getNavButtonStyles(theme, pathname, '/my-podcasts')}
              >
                Create
            </Button>
          )}


            {isAuthenticated ? (
              <Tooltip title="Profile">
                <IconButton
                  onClick={() => router.push('/profile')}
                  sx={{
                    p: 0.5,
                    border: pathname === '/profile' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      border: `2px solid ${theme.palette.primary.main}`,
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Avatar
                    src={user?.image || undefined}
                    alt={user?.name || 'Profile'}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {!user?.image && user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                variant="text"
                className="nav-button"
                onClick={() => router.push('/auth/login')}
                sx={getNavButtonStyles(theme, pathname, '/auth/login')}
              >
                Sign In
              </Button>
            )}
          </NavGroup>

          <HamburgerArea>
            {isAuthenticated ? (
              <IconButton
                onClick={() => router.push('/profile')}
                sx={{
                  p: 0.5,
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Avatar
                  src={user?.image || undefined}
                  alt={user?.name || 'Profile'}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontSize: '0.9rem',
                  }}
                >
                  {!user?.image && user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            ) : (
              <IconButton
                onClick={() => router.push('/auth/login')}
                sx={{
                  p: 0.5,
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <AccountCircleIcon sx={{ fontSize: '1.5rem' }} />
              </IconButton>
            )}
            <IconButton
              onClick={handleDrawerToggle}
              color="inherit"
              aria-label="menu"
              sx={{ 
                width: 36,
                height: 36,
                '& .MuiSvgIcon-root': {
                  fontSize: '1.5rem'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </HamburgerArea>
        </TopRow>

        {/* Bottom Row: Filter Buttons */}
        <BottomRow>
          <FiltersArea>
            <Button
              variant="text"
              onClick={() => handleFilterSelect('All')}
              sx={getFilterButtonStyles(theme, selectedFilter, 'All')}
            >
              All
            </Button>
            <Button
              variant="text"
              startIcon={<PodcastIcon />}
              onClick={() => handleFilterSelect('Podcasts')}
              sx={getFilterButtonStyles(theme, selectedFilter, 'Podcasts')}
            >
              Podcasts
            </Button>
            <Button
              variant="text"
              startIcon={<VideoIcon />}
              onClick={() => handleFilterSelect('Videos')}
              sx={getFilterButtonStyles(theme, selectedFilter, 'Videos')}
            >
              Videos
            </Button>
            <Button
              variant="text"
              startIcon={<StreamingIcon />}
              onClick={() => handleFilterSelect('Streaming')}
              sx={getFilterButtonStyles(theme, selectedFilter, 'Streaming')}
            >
              Streaming
            </Button>
            <Button
              variant="text"
              startIcon={<MusicIcon />}
              onClick={() => handleFilterSelect('Music')}
              sx={getFilterButtonStyles(theme, selectedFilter, 'Music')}
            >
              Music
            </Button>
            <Button
              variant="text"
              startIcon={<BookIcon />}
              onClick={() => handleFilterSelect('Books')}
              sx={getFilterButtonStyles(theme, selectedFilter, 'Books')}
            >
              Books
            </Button>
            <Button
              variant="text"
              startIcon={<NewsIcon />}
              onClick={() => handleFilterSelect('News')}
              sx={getFilterButtonStyles(theme, selectedFilter, 'News')}
            >
              News
            </Button>
          </FiltersArea>
        </BottomRow>
      </GridNav>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
});

export default MainNav; 