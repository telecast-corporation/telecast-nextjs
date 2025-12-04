
import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { MenuBook as BookIcon, Headphones as AudiobookIcon } from '@mui/icons-material';

interface BookTypeToggleProps {
  value: 'book' | 'audiobook';
  onChange: (value: 'book' | 'audiobook') => void;
}

export default function BookTypeToggle({ value, onChange }: BookTypeToggleProps) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'book' | 'audiobook' | null,
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="Book type"
      >
        <ToggleButton value="book" aria-label="books">
          <BookIcon sx={{ mr: 1 }} />
          <Typography>Books</Typography>
        </ToggleButton>
        <ToggleButton value="audiobook" aria-label="audiobooks">
          <AudiobookIcon sx={{ mr: 1 }} />
          <Typography>Audiobooks</Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
