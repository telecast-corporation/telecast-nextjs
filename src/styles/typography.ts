// Centralized Typography System
// Use these consistent font sizes across all components

export const typography = {
  // Main headings (page titles) - reduced by half
  title: {
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
    fontWeight: 700,
    lineHeight: 1.2,
  },
  
  // Section headings - reduced by half
  heading: {
    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
    fontWeight: 600,
    lineHeight: 1.3,
  },
  
  // Subheadings - reduced by half
  subheading: {
    fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem', lg: '1.1rem' },
    fontWeight: 500,
    lineHeight: 1.4,
  },
  
  // Body text (paragraphs, descriptions) - increased size
  body: {
    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1.1rem', lg: '1.3rem' },
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  // Button text - reduced by half
  button: {
    fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.85rem', lg: '0.95rem' },
    fontWeight: 600,
    lineHeight: 1.2,
  },
  
  // Form labels - reduced by half
  label: {
    fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem', lg: '0.9rem' },
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  // Form inputs - reduced by half
  input: {
    fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem', lg: '0.9rem' },
    fontWeight: 400,
    lineHeight: 1.4,
  },
  
  // Small text (captions, helper text) - reduced by half
  caption: {
    fontSize: { xs: '0.5rem', sm: '0.55rem', md: '0.6rem', lg: '0.65rem' },
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // Navigation text - UNCHANGED as requested
  nav: {
    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem', lg: '1rem' },
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