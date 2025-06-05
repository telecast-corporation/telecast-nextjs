'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#fa7202', // Vibrant Orange
      light: '#fb8c33',
      dark: '#c85a02',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0279c3', // Blue
      light: '#3498db',
      dark: '#015a94',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#F6AE2D', // Hunyadi Yellow
      light: '#f7c05d',
      dark: '#c58b24',
      contrastText: '#fff',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2F4858', // Charcoal
      secondary: '#33658A', // Lapis Lazuli
    },
    error: {
      main: '#F26419', // Orange Pantone
    },
    warning: {
      main: '#F6AE2D', // Hunyadi Yellow
    },
    info: {
      main: '#55DDE0', // Robin Egg Blue
    },
    success: {
      main: '#33658A', // Lapis Lazuli
    },
  },
  typography: {
    fontFamily: '"Lexend", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    body1: {
      fontFamily: '"Lexend", sans-serif',
      letterSpacing: '0.01em',
    },
    body2: {
      fontFamily: '"Lexend", sans-serif',
      letterSpacing: '0.01em',
    },
    button: {
      fontFamily: '"Lexend", sans-serif',
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#FFFFFF',
        },
      },
    },
  },
});

export default theme; 