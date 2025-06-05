import React from 'react';
import { TextField, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, loading }) => (
  <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search for podcasts, videos, music, or books..."
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </InputAdornment>
        ),
      }}
    />
  </form>
);

export default SearchBar; 