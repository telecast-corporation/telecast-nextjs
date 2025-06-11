'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const baseFont = "'Open Sans', Arial, sans-serif";

const lightPalette = {
  mode: 'light',
  background: {
    default: '#f4f6fa', // softer, warmer light gray
    paper: '#f9fafb',   // slightly off-white
  },
  text: {
    primary: '#23272f', // deep, soft charcoal
    secondary: '#4a5568',
  },
  primary: {
    main: '#2563eb', // vibrant blue
    light: '#60a5fa',
    dark: '#1e40af',
    contrastText: '#fff',
  },
  secondary: {
    main: '#f59e42', // modern orange accent
    light: '#fbbf24',
    dark: '#b45309',
    contrastText: '#fff',
  },
  divider: '#e3e8ee',
};

const darkPalette = {
  mode: 'dark',
  background: {
    default: '#23272f', // blue-gray, less intense
    paper: '#2d3340',   // lighter dark for cards
  },
  text: {
    primary: '#e3e8ee', // soft white
    secondary: '#b6bed1',
  },
  primary: {
    main: '#60a5fa', // lighter blue accent for dark
    light: '#93c5fd',
    dark: '#2563eb',
    contrastText: '#23272f',
  },
  secondary: {
    main: '#fbbf24',
    light: '#fde68a',
    dark: '#b45309',
    contrastText: '#23272f',
  },
  divider: '#3a4151',
};

function getTheme(isDarkMode) {
  return createTheme({
    palette: isDarkMode ? darkPalette : lightPalette,
    typography: {
      fontFamily: baseFont,
      h1: { fontWeight: 700, fontSize: '3.75rem' },
      h2: { fontWeight: 600, fontSize: '3rem' },
      h3: { fontWeight: 600, fontSize: '2.25rem' },
      h4: { fontWeight: 600, fontSize: '1.8rem' },
      h5: { fontWeight: 600, fontSize: '1.65rem' },
      h6: { fontWeight: 600, fontSize: '1.5rem' },
      body1: { fontSize: '1.65rem' },
      body2: { fontSize: '1.5rem' },
      button: { fontWeight: 600, fontSize: '1.5rem', textTransform: 'none' },
    },
    shape: { borderRadius: 18 }, // more rounded
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode
              ? '0 2px 12px rgba(0,0,0,0.35)' 
              : '0 2px 12px rgba(30,64,175,0.08)',
            borderRadius: 18,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDarkMode
              ? 'linear-gradient(90deg, #2d3340 0%, #23272f 100%)'
              : 'linear-gradient(90deg, #f9fafb 0%, #f4f6fa 100%)',
            boxShadow: isDarkMode
              ? '0 2px 8px rgba(0,0,0,0.25)'
              : '0 2px 8px rgba(30,64,175,0.06)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            fontWeight: 700,
            boxShadow: 'none',
            transition: 'background 0.2s, color 0.2s',
          },
          contained: {
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: isDarkMode
              ? '0 4px 24px rgba(0,0,0,0.25)'
              : '0 4px 24px rgba(37,99,235,0.08)',
            transition: 'box-shadow 0.2s',
            '&:hover': {
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0,0,0,0.35)'
                : '0 8px 32px rgba(37,99,235,0.16)',
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDarkMode ? '#23272f' : '#f4f6fa',
          },
        },
      },
    },
  });
}

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setIsDarkMode(savedMode === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', String(newMode));
      return newMode;
    });
  };

  const theme = getTheme(isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 