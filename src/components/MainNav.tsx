
'use client';

import React from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { headerHeight } from '@/styles/theme'; // Import headerHeight

const navLinks = [
  { label: 'All Content', href: '/search?type=all' },
  { label: 'Videos', href: '/search?type=video' },
  { label: 'Movies', href: '/search?type=movie' },
  { label: 'TV', href: '/search?type=tv' },
  { label: 'Podcasts', href: '/search?type=podcast' },
  { label: 'Books', href: '/search?type=book' },
  { label: 'Music', href: '/search?type=music' },
  { label: 'Community News', href: '/local-news' },
  { label: 'Share a Story', href: '/local-news/upload' },
];

const MainNav = () => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const activeTabIndex = React.useMemo(() => {
    const type = searchParams.get('type');
    const currentPath = pathname;

    let bestMatchIndex = -1;
    let longestMatchLength = -1;

    navLinks.forEach((link, index) => {
      const linkUrl = new URL(link.href, 'http://localhost:3000'); // Dummy base URL
      const linkType = linkUrl.searchParams.get('type');
      const linkPath = linkUrl.pathname;

      let isMatch = false;

      // Prioritize exact href match
      if (currentPath === link.href) {
        isMatch = true;
      } 
      // Match search pages by type
      else if (pathname === '/search' && linkPath === '/search' && type === linkType) {
        isMatch = true;
      } 
      // Match detail pages like /book/123 to the corresponding type
      else if (linkType && currentPath.startsWith(`/${linkType}/`)) {
        isMatch = true;
      } 
      // Match non-search pages by path prefix, e.g., /local-news/upload should match /local-news/upload
      else if (linkPath !== '/search' && currentPath.startsWith(linkPath)) {
        isMatch = true;
      }

      // The most specific match is the one with the longest href
      if (isMatch && link.href.length > longestMatchLength) {
        longestMatchLength = link.href.length;
        bestMatchIndex = index;
      }
    });
    
    // Fallback for /search page with no type to select 'All Content'
    if (bestMatchIndex === -1 && pathname === '/search' && !type) {
        return navLinks.findIndex(link => link.href.includes('type=all'));
    }

    return bestMatchIndex;
  }, [pathname, searchParams]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    router.push(navLinks[newValue].href);
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: isMobile ? 0.5 : 1,
        position: 'sticky',
        top: isMobile ? headerHeight.mobile : headerHeight.desktop, // Use responsive header height
        zIndex: theme.zIndex.appBar - 1,
      }}
    >
      <Container maxWidth="lg">
        <Tabs
          value={activeTabIndex === -1 ? false : activeTabIndex}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          aria-label="main navigation"
          sx={{
            // Center the tabs on all screen sizes
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
              alignItems: 'center', // Vertically center the tabs
              gap: isMobile ? 1 : 2,
            },
            // Add a more visible scrollbar for mobile
            ...(isMobile && {
              '& .MuiTabs-scroller': {
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.primary.main, // Use main theme color
                  borderRadius: '3px',
                },
              },
            }),
          }}
        >
          {navLinks.map((link, index) => (
            <Tab
              key={index}
              label={link.label}
              component={Link}
              href={link.href}
              sx={{
                px: isMobile ? 1.5 : 2,
                py: isMobile ? 0.5 : 1,
                minHeight: 'auto',
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: isMobile ? '0.8rem' : '0.95rem',
                color: theme.palette.text.secondary,
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                },
                '&:hover': {
                  backgroundColor: activeTabIndex !== index ? theme.palette.action.hover : undefined,
                  color: activeTabIndex !== index ? theme.palette.text.primary : undefined,
                },
              }}
            />
          ))}
        </Tabs>
      </Container>
    </Box>
  );
};

export default MainNav;
