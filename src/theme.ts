
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    // Define your typography here
    h1: {
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h2: {
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.6rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.4rem',
      },
    },
    h4: {
        fontSize: '1.5rem',
        '@media (max-width:600px)': {
          fontSize: '1.2rem',
        },
      },
      h5: {
        fontSize: '1.25rem',
        '@media (max-width:600px)': {
          fontSize: '1.1rem',
        },
      },
      h6: {
        fontSize: '1rem',
        '@media (max-width:600px)': {
          fontSize: '1rem',
        },
      },
      body1: {
        fontSize: '1rem',
        '@media (max-width:600px)': {
          fontSize: '0.9rem',
        },
      },
      body2: {
        fontSize: '0.875rem',
        '@media (max-width:600px)': {
          fontSize: '0.8rem',
        },
      },
      // You can also define other variants like subtitle1, caption, etc.
    },
  },
);

export default theme;
