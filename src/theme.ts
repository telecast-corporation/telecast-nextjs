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

const { palette } = createTheme();
const { augmentColor } = palette;

const createColor = (mainColor: string) => augmentColor({ color: { main: mainColor } });

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: createColor('#fa7202'), // Vibrant Orange
    secondary: createColor('#0279c3'), // Blue
    tertiary: createColor('#F6AE2D'), // Hunyadi Yellow
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2F4858', // Charcoal
      secondary: '#33658A', // Lapis Lazuli
    },
    error: createColor('#F26419'), // Orange Pantone
    warning: createColor('#F6AE2D'), // Hunyadi Yellow
    info: createColor('#55DDE0'), // Robin Egg Blue
    success: createColor('#33658A'), // Lapis Lazuli
  },
  typography: {
    fontFamily: '"Lexend", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '2.75rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '1.35rem',
    },
    h6: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    subtitle1: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 500,
      fontSize: '1.15rem',
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontFamily: '"Lexend", sans-serif',
      fontWeight: 500,
      fontSize: '1.05rem',
      letterSpacing: '0.01em',
    },
    body1: {
      fontFamily: '"Lexend", sans-serif',
      fontSize: '1.15rem',
      letterSpacing: '0.01em',
    },
    body2: {
      fontFamily: '"Lexend", sans-serif',
      fontSize: '1.05rem',
      letterSpacing: '0.01em',
    },
    button: {
      fontFamily: '"Lexend", sans-serif',
      fontSize: '1.1rem',
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
      defaultProps: {
        color: 'primary',
      },
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
        text: {
          color: '#fa7202',
          '&:hover': {
            backgroundColor: 'rgba(250, 114, 2, 0.04)',
          },
        },
        outlined: {
          borderColor: '#fa7202',
          color: '#fa7202',
          '&:hover': {
            borderColor: '#c85a02',
            backgroundColor: '#fa7202',
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#fa7202',
          '&:hover': {
            backgroundColor: 'rgba(250, 114, 2, 0.04)',
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