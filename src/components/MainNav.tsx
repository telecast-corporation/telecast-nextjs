
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
  { label: 'All', href: '/' },
  { label: 'Videos', href: '/search?type=video' },
  { label: 'Movies', href: '/search?type=tv' },
  { label: 'Podcasts', href: '/search?type=podcast' },
  { label: 'Books', href: '/search?type=book' },
  { label: 'Music', href: '/search?type=music' },
  { label: 'News', href: '/search?type=news' },
  { label: 'Search Events', href: '/events' },
  { label: 'Upload', href: '/events/upload' },
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
      // Match non-search pages by path prefix, e.g., /events/upload should match /events/upload
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
        borderBottom: `0`,
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
          variant={'standard'}
          scrollButtons={false}
          aria-label="main navigation"
          sx={{
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            // Center the tabs on all screen sizes
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
              alignItems: 'center', // Vertically center the tabs
              gap: isMobile ? 0.2 : 2,
              flexWrap: 'wrap',
            },
            '& .MuiTabs-scroller': {
                overflowX: 'hidden',
                scrollbarWidth: 'none', /* Firefox */
                '&::-webkit-scrollbar': {
                    display: 'none' /* Safari and Chrome */
                }
            }
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
                py: isMobile ? 0.75 : 1,
                minHeight: 'auto',
                minWidth: 'auto',
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
