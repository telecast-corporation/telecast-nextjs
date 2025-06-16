// Centralized Typography System
// Use these consistent font sizes across all components

export const typography = {
  // Main headings (page titles)
  title: {
    fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
    fontWeight: 700,
    lineHeight: 1.2,
  },
  
  // Section headings
  heading: {
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
    fontWeight: 600,
    lineHeight: 1.3,
  },
  
  // Subheadings
  subheading: {
    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.2rem' },
    fontWeight: 500,
    lineHeight: 1.4,
  },
  
  // Body text (paragraphs, descriptions)
  body: {
    fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem', lg: '1.8rem' },
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  // Button text
  button: {
    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem', lg: '1.9rem' },
    fontWeight: 600,
    lineHeight: 1.2,
  },
  
  // Form labels
  label: {
    fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem', lg: '1.8rem' },
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  // Form inputs
  input: {
    fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem', lg: '1.8rem' },
    fontWeight: 400,
    lineHeight: 1.4,
  },
  
  // Small text (captions, helper text)
  caption: {
    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem', lg: '1.3rem' },
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // Navigation text
  nav: {
    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem', lg: '1.9rem' },
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