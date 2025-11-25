
"use client";
import React, { useState, useMemo } from ''';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { countries } from "@/lib/countries";

const LocalNewsUploadPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const cities = useMemo(() => {
    if (!country) return [];
    const selectedCountry = countries.find((c) => c.name === country);
    return selectedCountry ? selectedCountry.cities : [];
  }, [country]);

  const handleCountryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCountry(event.target.value as string);
    setCity("");
  };

  const handleCityChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCity(event.target.value as string);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !title || !description || !country || !city) {
      console.error("All fields are required.");
      // Here you could add user-facing feedback, e.g., a snackbar/alert
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('locationCity', city);
    formData.append('locationCountry', country);

    try {
      const response = await fetch('/api/local-news', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Handle success, e.g., show a success message or redirect
        console.log("Upload successful!");
      } else {
        // Handle error
        console.error("Upload failed.");
      }
    } catch (error) {
      console.error("An error occurred during upload:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Local News
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            fullWidth
            required
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            required
            multiline
            rows={4}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="country-select-label">Country</InputLabel>
            <Select
              labelId="country-select-label"
              value={country}
              onChange={handleCountryChange}
              label="Country"
            >
              {countries.map((c) => (
                <MenuItem key={c.code} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required disabled={!country}>
            <InputLabel id="city-select-label">City</InputLabel>
            <Select
              labelId="city-select-label"
              value={city}
              onChange={handleCityChange}
              label="City"
            >
              {cities.map((cityName) => (
                <MenuItem key={cityName} value={cityName}>
                  {cityName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <input
              accept="video/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button variant="contained" component="span">
                Choose Video
              </Button>
            </label>
            {file && <Typography variant="body1" sx={{ display: 'inline', ml: 2 }}>{file.name}</Typography>}
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default LocalNewsUploadPage;
