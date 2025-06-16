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
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useDebounce from '@/hooks/useDebounce';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
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
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.primary.main,
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
  color: theme.palette.primary.main,
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
  fontSize: '1.5rem', // Larger font size for better visibility
  fontWeight: pathname === targetPath ? 700 : 600,
  textTransform: 'none',
  borderRadius: 2,
  px: 2,
  py: 1,
  backgroundColor: pathname === targetPath ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  border: pathname === targetPath ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
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

const GridNav = styled(AppBar)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(15, 1fr)',
  gridTemplateRows: 'auto auto',
  gridTemplateAreas: `
    "logo logo logo search search search search search search search search theme about services contact login"
    "logo logo logo filters filters filters filters filters filters filters filters theme about services contact login"
  `,
  gap: theme.spacing(2),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  width: '100%',
  maxWidth: 'none',
  left: 0,
  right: 0,
  marginBottom: theme.spacing(8),
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridTemplateRows: 'auto auto auto auto',
    gridTemplateAreas: `
      "logo logo logo logo logo logo"
      "logo logo logo logo logo logo"
      "search search search search search search"
      "filters filters filters filters filters filters"
    `,
    paddingRight: theme.spacing(1),
    width: '100vw',
    margin: 0,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(8),
  },
}));

const LogoArea = styled(Box)(({ theme }) => ({
  gridArea: 'logo',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  height: '100%',
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  gridArea: 'search',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
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
}));

const FiltersArea = styled(Box)(({ theme }) => ({
  gridArea: 'filters',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

const AboutButton = styled(Box)(({ theme }) => ({
  gridArea: 'about',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const ServicesButton = styled(Box)(({ theme }) => ({
  gridArea: 'services',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const LoginButton = styled(Box)(({ theme }) => ({
  gridArea: 'login',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const ThemeButton = styled(Box)(({ theme }) => ({
  gridArea: 'theme',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const ContactButton = styled(Box)(({ theme }) => ({
  gridArea: 'contact',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

// Add hamburger menu area
const HamburgerArea = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  zIndex: theme.zIndex.appBar + 1,
  [theme.breakpoints.up('lg')]: {
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
  const { isDarkMode, toggleDarkMode } = useAppTheme();

  // Convert filter to API type
  const getApiType = (filter: string) => {
    const typeMap: { [key: string]: string } = {
      'All': 'all',
      'Podcasts': 'podcast',
      'Videos': 'video',
      'Music': 'music',
      'Books': 'book'
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
    { value: 'Music', icon: <MusicIcon /> },
    { value: 'Books', icon: <BookIcon /> }
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
      case 'music':
        return <MusicIcon />;
      case 'book':
        return <BookIcon />;
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
                    <Typography variant="body2" noWrap>
                      {suggestion.title}
                    </Typography>
                  }
                  secondary={
                    suggestion.author && (
                      <Typography variant="body2" color="text.secondary" noWrap>
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
        <ListItem button onClick={() => router.push('/about')} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText 
            primary="About" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              fontWeight: 600 
            }} 
          />
        </ListItem>
        
        <ListItem button onClick={() => router.push('/services')} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Services" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              fontWeight: 600 
            }} 
          />
        </ListItem>
        
        <ListItem button onClick={() => router.push('/contact')} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Contact" 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              fontWeight: 600 
            }} 
          />
        </ListItem>
        
        <Divider sx={{ my: 1 }} />

        <ListItem button onClick={toggleDarkMode} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText 
            primary={isDarkMode ? 'Light Mode' : 'Dark Mode'} 
            primaryTypographyProps={{ 
              fontFamily: lexend.style.fontFamily,
              fontWeight: 600 
            }} 
          />
        </ListItem>
      </List>
    </Box>
  );

  // Don't render the navbar until auth state is determined
  if (authLoading) {
    return (
      <GridNav position="fixed" color="default" elevation={1}>
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
      <GridNav position="fixed" color="default" elevation={1}>
        <LogoArea>
          <Link href="/" passHref>
            <Box
              component="a"
      sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                textDecoration: 'none',
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
      </LogoArea>

        <SearchContainer>
          <SearchWrapper ref={searchBoxRef} sx={{ position: 'relative' }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <SearchInput
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => searchQuery.length >= 2 && setAutocompleteOpen(true)}
            />
            {renderAutocompleteResults()}
          </SearchWrapper>
        </SearchContainer>

              <FiltersArea>
        <Button
          variant="text"
          onClick={() => handleFilterSelect('All')}
                        sx={{
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(1, 2),
            backgroundColor: selectedFilter === 'All' ? theme.palette.primary.main : 'transparent',
            color: selectedFilter === 'All' ? theme.palette.primary.contrastText : theme.palette.primary.main,
            fontFamily: lexend.style.fontFamily,
                          '&:hover': {
              backgroundColor: selectedFilter === 'All' ? theme.palette.primary.dark : theme.palette.action.hover,
            },
          }}
        >
          All
        </Button>
        <Button
          variant="text"
          startIcon={<PodcastIcon />}
          onClick={() => handleFilterSelect('Podcasts')}
                      sx={{ 
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(1, 2),
            backgroundColor: selectedFilter === 'Podcasts' ? theme.palette.primary.main : 'transparent',
            color: selectedFilter === 'Podcasts' ? theme.palette.primary.contrastText : theme.palette.primary.main,
            fontFamily: lexend.style.fontFamily,
                        '&:hover': {
              backgroundColor: selectedFilter === 'Podcasts' ? theme.palette.primary.dark : theme.palette.action.hover,
            },
          }}
        >
          Podcasts
        </Button>
        <Button
          variant="text"
          startIcon={<VideoIcon />}
          onClick={() => handleFilterSelect('Videos')}
                  sx={{ 
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(1, 2),
            backgroundColor: selectedFilter === 'Videos' ? theme.palette.primary.main : 'transparent',
            color: selectedFilter === 'Videos' ? theme.palette.primary.contrastText : theme.palette.primary.main,
            fontFamily: lexend.style.fontFamily,
                    '&:hover': {
              backgroundColor: selectedFilter === 'Videos' ? theme.palette.primary.dark : theme.palette.action.hover,
            },
          }}
        >
          Videos
                    </Button>
        <Button
          variant="text"
          startIcon={<MusicIcon />}
          onClick={() => handleFilterSelect('Music')}
                  sx={{ 
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(1, 2),
            backgroundColor: selectedFilter === 'Music' ? theme.palette.primary.main : 'transparent',
            color: selectedFilter === 'Music' ? theme.palette.primary.contrastText : theme.palette.primary.main,
                    '&:hover': {
              backgroundColor: selectedFilter === 'Music' ? theme.palette.primary.dark : theme.palette.action.hover,
            },
          }}
        >
          Music
        </Button>
                      <Button
          variant="text"
          startIcon={<BookIcon />}
          onClick={() => handleFilterSelect('Books')}
                        sx={{
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(1, 2),
            backgroundColor: selectedFilter === 'Books' ? theme.palette.primary.main : 'transparent',
            color: selectedFilter === 'Books' ? theme.palette.primary.contrastText : theme.palette.primary.main,
                            '&:hover': {
              backgroundColor: selectedFilter === 'Books' ? theme.palette.primary.dark : theme.palette.action.hover,
            },
                        }}
                      >
          Books
                      </Button>
      </FiltersArea>

        <ThemeButton>
          <IconButton onClick={toggleDarkMode}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </ThemeButton>

        <AboutButton>
          <Link href="/about" passHref>
            <Button 
              variant="text"
              sx={getNavButtonStyles(theme, pathname, '/about')}
            >
              About
            </Button>
          </Link>
        </AboutButton>

        <ServicesButton>
          <Link href="/services" passHref>
            <Button 
              variant="text"
              sx={getNavButtonStyles(theme, pathname, '/services')}
            >
              Services
            </Button>
          </Link>
        </ServicesButton>

        <ContactButton>
          <Link href="/contact" passHref>
            <Button 
              variant="text"
              sx={getNavButtonStyles(theme, pathname, '/contact')}
            >
              Contact
            </Button>
          </Link>
        </ContactButton>

        <LoginButton>
          {isAuthenticated ? (
            <>
              <IconButton
                onClick={(e) => setProfileAnchorEl(e.currentTarget)}
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                {user?.image ? (
                  <Avatar src={user.image} alt={user.name || 'Profile'} />
                ) : (
                  <Avatar>{user?.name?.[0] || <AccountCircleIcon />}</Avatar>
                )}
              </IconButton>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={() => setProfileAnchorEl(null)}
              >
                <MenuItem onClick={() => router.push('/dashboard')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={logout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton
              onClick={() => router.push('/login')}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <Avatar>{user?.name?.[0] || <AccountCircleIcon />}</Avatar>
            </IconButton>
          )}
        </LoginButton>

        <HamburgerArea>
          <MobileLoginButton>
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={(e) => setProfileAnchorEl(e.currentTarget)}
                  sx={{
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  {user?.image ? (
                    <Avatar src={user.image} alt={user.name || 'Profile'} />
                  ) : (
                    <Avatar>{user?.name?.[0] || <AccountCircleIcon />}</Avatar>
                  )}
                </IconButton>
                <Menu
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={() => setProfileAnchorEl(null)}
                >
                  <MenuItem onClick={() => router.push('/dashboard')}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={logout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                onClick={() => router.push('/login')}
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                <Avatar>{user?.name?.[0] || <AccountCircleIcon />}</Avatar>
              </IconButton>
            )}
          </MobileLoginButton>
          <IconButton
            onClick={handleDrawerToggle}
            color="inherit"
            aria-label="menu"
            sx={{ 
              width: 48,
              height: 48,
              '& .MuiSvgIcon-root': {
                fontSize: '2rem'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </HamburgerArea>
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