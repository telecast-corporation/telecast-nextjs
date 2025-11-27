
'use client';

import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, TextField, InputAdornment } from '@mui/material';
import { Filter, Search } from 'lucide-react';
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
    borderRadius: '9999px',
    padding: '10px 20px',
    backgroundColor: 'black',
    color: 'white',
    '&:hover': {
      backgroundColor: '#333',
    },
    '&.Mui-disabled': {
        backgroundColor: '#555',
        color: '#aaa'
    },
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        onClick={() => setOpenCountry(true)}
        sx={buttonSx}
        startIcon={<Filter />}
      >
        {country || 'Country'}
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
          <List>
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
        sx={buttonSx}
        startIcon={<Filter />}
      >
        {city || 'City'}
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
          <List>
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
