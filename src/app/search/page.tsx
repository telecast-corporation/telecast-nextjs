'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import UnifiedSearchResults from '@/components/UnifiedSearchResults';
import SearchResults from './SearchResults';

interface SearchResult {
  type: 'video' | 'book' | 'podcast' | 'music';
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  author?: string;
  // Video specific
  channelTitle?: string;
  publishedAt?: string;
  // Book specific
  authors?: string[];
  publishedDate?: string;
  categories?: string[];
  rating?: number;
  ratingsCount?: number;
  // Podcast specific
  duration?: string;
  // Music specific
  album?: string;
  releaseDate?: string;
  }

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
} 