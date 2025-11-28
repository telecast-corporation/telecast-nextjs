// Centralized Typography System
// Use these consistent font sizes across all components

export const typography = {
  // Main headings (page titles)
  title: {
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
    fontWeight: 700,
    lineHeight: 1.2,
  },
  
  // Section headings
  heading: {
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
    fontWeight: 600,
    lineHeight: 1.3,
  },
  
  // Subheadings
  subheading: {
    fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem', lg: '1.625rem' },
    fontWeight: 500,
    lineHeight: 1.4,
  },
  
  // Body text (paragraphs, descriptions)
  body: {
    fontSize: { xs: '1rem', sm: '1rem', md: '1.125rem', lg: '1.125rem' },
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  // Button text
  button: {
    fontSize: { xs: '1rem', sm: '1rem', md: '1.125rem', lg: '1.125rem' },
    fontWeight: 600,
    lineHeight: 1.2,
  },
  
  // Form labels
  label: {
    fontSize: { xs: '0.875rem', sm: '0.875rem', md: '1rem', lg: '1rem' },
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  // Form inputs
  input: {
    fontSize: { xs: '1rem', sm: '1rem', md: '1.125rem', lg: '1.125rem' },
    fontWeight: 400,
    lineHeight: 1.4,
  },
  
  // Small text (captions, helper text)
  caption: {
    fontSize: { xs: '0.75rem', sm: '0.75rem', md: '0.875rem', lg: '0.875rem' },
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // Navigation text - UNCHANGED as requested
  nav: {
    fontSize: { xs: '4vw', sm: '3vw', md: '2vw', lg: '1vw' },
    fontWeight: 600,
    lineHeight: 1.2,
  },
};

// Spacing system for consistent margins and padding
export const spacing = {
  // Component padding
  component: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
  },
  
  // Section margins
  section: {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
  },
  
  // Element gaps
  gap: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
  },
  
  // Button padding
  button: {
    xs: '0.5rem 1rem',
    sm: '0.75rem 1.25rem',
    md: '1rem 1.5rem',
    lg: '1.25rem 1.75rem',
  },
  
  // Input padding
  input: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
  },
};


// Border radius system
export const borderRadius = {
  small: '0.5rem',
  medium: '0.75rem',
  large: '1rem',
  xlarge: '1.25rem',
};

// Navbar sizing configuration - change these values to automatically update everywhere
export const navbarSizing = {
  height: {
    lg: '12vh',    // Large screens navbar height
    md: '20vh',    // Medium screens navbar height  
    sm: '20vh',    // Small screens navbar height
    xs: '20vh',    // Extra small screens navbar height
  },
  // Automatically calculated page padding (navbar height + 5vh)
  pagePadding: {
    lg: 'calc(12vh + 5vh)',  // 17vh total
    md: 'calc(20vh + 5vh)',  // 25vh total
    sm: 'calc(20vh + 5vh)',  // 25vh total
    xs: 'calc(20vh + 5vh)',  // 25vh total
  }
};
