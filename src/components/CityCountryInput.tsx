
'use client';

import { useState, useEffect } from 'react';
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
  const [country, setCountry] = useState(initialCountry);
  const [city, setCity] = useState(initialCity);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    onCountryChange(country);
    if (country && cities[country]) {
      setSuggestions(cities[country]);
    } else {
      setSuggestions([]);
    }
  }, [country, onCountryChange]);

  useEffect(() => {
    onCityChange(city);
  }, [city, onCityChange]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountry(value);
    if (value) {
      const filteredCountries = countries.filter((c) =>
        c.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredCountries);
    } else {
      setSuggestions([]);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    if (country && cities[country]) {
      const filteredCities = cities[country].filter((c) =>
        c.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredCities);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (value: string) => {
    if (countries.includes(value)) {
      setCountry(value);
      setCity(''); // Reset city when a new country is selected
      setSuggestions(cities[value] || []);
    } else {
      setCity(value);
      setSuggestions([]);
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={handleCountryChange}
          className="border-gray-300 rounded-md shadow-sm w-full"
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={handleCityChange}
          className="border-gray-300 rounded-md shadow-sm w-full"
          disabled={!country}
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
