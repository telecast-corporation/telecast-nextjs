import { createTheme } from '@mui/material/styles';

// Define header heights for different screen sizes
export const headerHeight = {
  mobile: '60px',
  desktop: '70px',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3A8DFF', // A vibrant blue
    },
    secondary: {
      main: '#9C27B0', // A rich purple
    },
    background: {
      default: '#121212', // A darker background
      paper: '#1E1E1E', // Slightly lighter for surfaces
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h1: {
      fontWeight: 700,
      color: '#FFFFFF',
    },
    h2: {
      fontWeight: 700,
      color: '#FFFFFF',
    },
    h3: {
      fontWeight: 600,
      color: '#F5F5F5',
    },
    h4: {
      fontWeight: 600,
      color: '#F5F5F5',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          color: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          borderRadius: '16px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(18, 18, 18, 0.8)',
                backdropFilter: 'blur(10px)',
            }
        }
    }
  },
});

export default theme;
