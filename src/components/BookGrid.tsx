import React from 'react';
import { Grid } from '@mui/material';
import BookCard from './BookCard';
import { TrendingItem } from '../types';

interface BookGridProps {
  books: TrendingItem[];
}

const BookGrid: React.FC<BookGridProps> = ({ books }) => {
  return (
    <Grid container spacing={2}>
      {books.map((book: TrendingItem) => (
        <Grid item xs={12} sm={6} md={4} key={book.id}>
          <BookCard book={book} type={book.type as 'book' | 'audiobook' || 'book'} />
        </Grid>
      ))}
    </Grid>
  );
};

export default BookGrid;
