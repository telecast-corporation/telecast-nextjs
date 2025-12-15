'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/dexie';
import { countries, cities as citiesData } from '@/lib/locations';

const categories = [
  "Technology",
  "Business",
  "Science",
  "Health",
  "Education",
  "Entertainment",
  "Sports",
  "News",
  "Other",
];

const EventsPage = () => {
  const news = useLiveQuery(() => db.localNews.toArray(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openCountryDialog, setOpenCountryDialog] = useState(false);
  const [openCityDialog, setOpenCityDialog] = useState(false);

  useEffect(() => {
    if (news) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [news]);

  const filteredNews = news?.filter(article => {
    if (!article || !article.isApproved) return false;
    const categoryMatch = category
      ? article.category?.toLowerCase().includes(category.toLowerCase())
      : true;
    const countryMatch = country
      ? article.country?.toLowerCase().includes(country.toLowerCase())
      : true;
    const cityMatch = city
      ? article.city?.toLowerCase().includes(city.toLowerCase())
      : true;
    return categoryMatch && countryMatch && cityMatch;
  });

  const handleClearFilters = () => {
    setCategory('');
    setCountry('');
    setCity('');
  };

  const cities = country ? citiesData[country] || [] : [];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Events
        </Typography>
        <Button component={Link} href="/events/upload" variant="contained" color="primary">
          Upload Event
        </Button>
      </Box>

      <Box mb={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
        <Button variant={!category && !country && !city ? "contained" : "outlined"} onClick={handleClearFilters}>All</Button>
        <Button variant={category ? "contained" : "outlined"} onClick={() => setOpenCategoryDialog(true)}>Category</Button>
        <Button variant={country ? "contained" : "outlined"} onClick={() => setOpenCountryDialog(true)}>Country</Button>
        <Button variant={city ? "contained" : "outlined"} onClick={() => setOpenCityDialog(true)}>City</Button>
      </Box>

      <Box display="flex" justifyContent="center" gap={1} mb={4} flexWrap="wrap">
          {category && <Chip label={`Category: ${category}`} onDelete={() => setCategory('')} />}
          {country && <Chip label={`Country: ${country}`} onDelete={() => setCountry('')} />}
          {city && <Chip label={`City: ${city}`} onDelete={() => setCity('')} />}
      </Box>

      {/* Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Select Category</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenCategoryDialog(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Country Dialog */}
      <Dialog open={openCountryDialog} onClose={() => setOpenCountryDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Select Country</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCity('');
              }}
              label="Country"
            >
              {countries.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCountryDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenCountryDialog(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* City Dialog */}
      <Dialog open={openCityDialog} onClose={() => setOpenCityDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Select City</DialogTitle>
        <DialogContent>
          <FormControl fullWidth disabled={!country}>
            <InputLabel>City</InputLabel>
            <Select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              label="City"
            >
              {cities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCityDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenCityDialog(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>


      {filteredNews && filteredNews.length > 0 ? (
        <Grid container spacing={4} justifyContent="center">
          {filteredNews.map(article => (
            <Grid item key={article.id} xs={12} sm={8} md={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardActionArea
                  component={Link}
                  href={`/events/view?id=${article.id}`}
                >
                  {article.videoUrl && (
                    <CardMedia
                      component="video"
                      src={article.videoUrl}
                      title={article.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                      }}
                      controls
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {`${article.description.slice(0, 100)}...`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography align="center">No events found.</Typography>
      )}
    </Container>
  );
};

export default EventsPage;
