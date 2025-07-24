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
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
        Show:
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="book type selection"
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 1.5,
            py: 0.5,
            fontSize: '0.8rem',
            minHeight: '32px',
            border: '1px solid',
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              color: 'text.primary',
            },
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          },
        }}
      >
        <ToggleButton value="books" aria-label="books only">
          <BookIcon sx={{ mr: 0.5, fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            Books
          </Typography>
        </ToggleButton>
        <ToggleButton value="audiobooks" aria-label="audiobooks only">
          <AudiobookIcon sx={{ mr: 0.5, fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            Audiobooks
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
} 