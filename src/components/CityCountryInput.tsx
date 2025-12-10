
'use client';

import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, TextField, InputAdornment } from '@mui/material';
import { Search, ChevronDown } from 'lucide-react';
import { countries, cities } from '../lib/locations';

interface CityCountryInputProps {
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
  initialCity?: string;
  initialCountry?: string;
}

export default function CityCountryInput({
  onCityChange,
  onCountryChange,
  initialCity = '',
  initialCountry = '',
}: CityCountryInputProps) {
  const [country, setCountry] = useState<string | null>(initialCountry);
  const [city, setCity] = useState<string | null>(initialCity);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  useEffect(() => {
    if (country) {
      onCountryChange(country);
      setCityOptions(cities[country] || []);
    } else {
        onCountryChange('');
        setCityOptions([]);
    }
  }, [country, onCountryChange]);

  useEffect(() => {
    if (city) {
        onCityChange(city);
    } else {
        onCityChange('');
    }
  }, [city, onCityChange]);

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCities = cityOptions.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const buttonSx = {
    flexGrow: 1,
    justifyContent: 'space-between',
    textAlign: 'left',
    color: 'text.secondary',
    borderColor: 'divider',
    py: 1.5,
    px: 2,
    borderRadius: '8px',
    textTransform: 'none',
    fontSize: '1rem',
    '&:hover': {
      borderColor: 'primary.main',
      backgroundColor: 'action.hover'
    }
  };


  return (
    <div className="flex flex-col md:flex-row gap-4 my-4">
      <Button
        onClick={() => setOpenCountry(true)}
        variant="outlined"
        endIcon={<ChevronDown size={20} />}
        sx={{...buttonSx, color: country ? 'text.primary' : 'text.secondary'}}
      >
        {country || 'Select Country'}
      </Button>
      <Dialog open={openCountry} onClose={() => setOpenCountry(false)} fullWidth maxWidth="xs">
        <DialogTitle>Select Country</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search country..."
            value={countrySearch}
            onChange={(e) => {setCountrySearch(e.target.value)}}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
            {filteredCountries.map((c) => (
              <ListItem button key={c} onClick={() => {
                setCountry(c);
                setCity(null); // Reset city when country changes
                setOpenCountry(false);
                setCountrySearch('');
              }}>
                <ListItemText primary={c} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => setOpenCity(true)}
        disabled={!country}
        variant="outlined"
        endIcon={<ChevronDown size={20} />}
        sx={{...buttonSx, color: city ? 'text.primary' : 'text.secondary', '&.Mui-disabled': { borderColor: 'divider' } }}
      >
        {city || 'Select City'}
      </Button>
      <Dialog open={openCity} onClose={() => setOpenCity(false)} fullWidth maxWidth="xs">
        <DialogTitle>Select City</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search city..."
            value={citySearch}
            onChange={(e) => {setCitySearch(e.target.value)}}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
            {filteredCities.map((c) => (
              <ListItem button key={c} onClick={() => {
                setCity(c);
                setOpenCity(false);
                setCitySearch('');
              }}>
                <ListItemText primary={c} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
}
