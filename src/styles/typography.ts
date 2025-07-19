// Centralized Typography System
// Use these consistent font sizes across all components

export const typography = {
  // Main headings (page titles) - responsive with minimum sizes
  title: {
    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
    fontWeight: 700,
    lineHeight: 1.2,
  },
  
  // Section headings - responsive with minimum sizes
  heading: {
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
    fontWeight: 600,
    lineHeight: 1.3,
  },
  
  // Subheadings - responsive with minimum sizes
  subheading: {
    fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.6rem', lg: '1.8rem' },
    fontWeight: 500,
    lineHeight: 1.4,
  },
  
  // Body text (paragraphs, descriptions) - increased size for mobile
  body: {
    fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem', lg: '1.15rem' },
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  // Button text - responsive with minimum sizes
  button: {
    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem', lg: '1.1rem' },
    fontWeight: 600,
    lineHeight: 1.2,
  },
  
  // Form labels - responsive with minimum sizes
  label: {
    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem', lg: '1.1rem' },
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  // Form inputs - responsive with minimum sizes
  input: {
    fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem', lg: '1.15rem' },
    fontWeight: 400,
    lineHeight: 1.4,
  },
  
  // Small text (captions, helper text) - increased minimum size
  caption: {
    fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // Navigation text - responsive with minimum sizes
  nav: {
    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem', lg: '1.1rem' },
    fontWeight: 600,
    lineHeight: 1.2,
  },
};

// Spacing system for consistent margins and padding
export const spacing = {
  // Component padding - increased for mobile
  component: { xs: 2, sm: 3, md: 4, lg: 6 },
  
  // Section margins - increased for mobile
  section: { xs: 3, sm: 4, md: 5, lg: 6 },
  
  // Element gaps - increased for mobile
  gap: { xs: 1.5, sm: 2, md: 3, lg: 4 },
  
  // Button padding - increased for mobile touch targets
  button: { 
    xs: '0.75rem 1.25rem', 
    sm: '0.875rem 1.5rem', 
    md: '1rem 2rem', 
    lg: '1.125rem 2.5rem' 
  },
  
  // Input padding - increased for mobile
  input: { 
    xs: '0.875rem', 
    sm: '1rem', 
    md: '1.125rem', 
    lg: '1.25rem' 
  },
};

// Border radius system
export const borderRadius = {
  small: '0.5rem',
  medium: '0.75rem',
  large: '1rem',
  xlarge: '1.25rem',
};

// Navbar sizing configuration - optimized for mobile
export const navbarSizing = {
  height: {
    lg: '4rem',    // Large screens navbar height
    md: '4rem',    // Medium screens navbar height  
    sm: '4rem',    // Small screens navbar height
    xs: '4rem',    // Extra small screens navbar height
  },
  // Automatically calculated page padding (navbar height + 1rem)
  pagePadding: {
    lg: '5rem',  // 4rem + 1rem
    md: '5rem',  // 4rem + 1rem
    sm: '5rem',  // 4rem + 1rem
    xs: '5rem',  // 4rem + 1rem
  }
}; 