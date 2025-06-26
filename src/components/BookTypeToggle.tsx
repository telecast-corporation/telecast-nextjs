import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { MenuBook as BookIcon, Headphones as AudiobookIcon } from '@mui/icons-material';

interface BookTypeToggleProps {
  value: 'books' | 'audiobooks';
  onChange: (value: 'books' | 'audiobooks') => void;
}

export default function BookTypeToggle({ value, onChange }: BookTypeToggleProps) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'books' | 'audiobooks' | null,
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="subtitle1" color="text.secondary">
        Show:
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="book type selection"
        size="small"
      >
        <ToggleButton value="books" aria-label="books only">
          <BookIcon sx={{ mr: 1, fontSize: 16 }} />
          <Typography variant="body2">
            Books
          </Typography>
        </ToggleButton>
        <ToggleButton value="audiobooks" aria-label="audiobooks only">
          <AudiobookIcon sx={{ mr: 1, fontSize: 16 }} />
          <Typography variant="body2">
            Audiobooks
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
} 