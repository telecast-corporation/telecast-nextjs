import React from 'react';
import { Grid, CardActionArea } from '@mui/material';
import BookCard from './BookCard';
import { TrendingItem } from '../types';

interface BookGridProps {
  books: TrendingItem[];
  onItemClick: (item: TrendingItem) => void;
}

const BookGrid: React.FC<BookGridProps> = ({ books, onItemClick }) => {
  return (
    <Grid container spacing={2}>
      {books.map((book: TrendingItem) => {
        const bookType = book.type === 'audiobook' || book.narrator ? 'audiobook' : 'book';
        return (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <CardActionArea onClick={() => onItemClick(book)}>
              <BookCard book={book} type={bookType} />
            </CardActionArea>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default BookGrid;
