// Centralized Typography System
// Use these consistent font sizes across all components

export const typography = {
  // Main headings (page titles) - reduced by half
  title: {
    fontSize: { xs: '5vw', sm: '4vw', md: '3vw', lg: '2vw' },
    fontWeight: 700,
    lineHeight: 1.2,
  },
  
  // Section headings - reduced by half
  heading: {
    fontSize: { xs: '3.5vw', sm: '2.8vw', md: '2vw', lg: '1.5vw' },
    fontWeight: 600,
    lineHeight: 1.3,
  },
  
  // Subheadings - reduced by half
  subheading: {
    fontSize: { xs: '2.5vw', sm: '2vw', md: '1.5vw', lg: '1vw' },
    fontWeight: 500,
    lineHeight: 1.4,
  },
  
  // Body text (paragraphs, descriptions) - increased size
  body: {
    fontSize: { xs: '2vw', sm: '1.5vw', md: '1vw', lg: '0.9vw' },
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  // Button text - reduced by half
  button: {
    fontSize: { xs: '2vw', sm: '1.5vw', md: '1vw', lg: '0.9vw' },
    fontWeight: 600,
    lineHeight: 1.2,
  },
  
  // Form labels - reduced by half
  label: {
    fontSize: { xs: '1.8vw', sm: '1.3vw', md: '1vw', lg: '0.8vw' },
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  // Form inputs - reduced by half
  input: {
    fontSize: { xs: '1.8vw', sm: '1.3vw', md: '1vw', lg: '0.8vw' },
    fontWeight: 400,
    lineHeight: 1.4,
  },
  
  // Small text (captions, helper text) - reduced by half
  caption: {
    fontSize: { xs: '1.2vw', sm: '1vw', md: '0.8vw', lg: '0.7vw' },
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
  component: { xs: 3, sm: 4, md: 6, lg: 8 },
  
  // Section margins
  section: { xs: 4, sm: 5, md: 6, lg: 8 },
  
  // Element gaps
  gap: { xs: 2, sm: 3, md: 4, lg: 5 },
  
  // Button padding
  button: { xs: '1rem 1.5rem', sm: '1.25rem 2rem', md: '1.5rem 2.5rem', lg: '1.75rem 3rem' },
  
  // Input padding
  input: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
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