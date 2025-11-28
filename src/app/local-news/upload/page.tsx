
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CityCountryInput from '@/components/CityCountryInput'; // Import the new component
import { useAuth } from '@/contexts/AuthContext'; // To get user location
import { getOrCreateUser } from '@/lib/auth0-user';

const LocalNewsUploadPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { user } = useAuth(); // Get user from auth context

  // Geo-location: Set initial country and city based on user's profile
  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const response = await fetch('/api/profile');
        const profile = await response.json();
        if (profile) {
          setCountry(profile.country || '');
          setCity(profile.city || '');
        }
      }
    };
    fetchUser();
  }, [user]);

  useEffect(() => {
    // Clean up the object URL to avoid memory leaks
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setVideoPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setVideoPreviewUrl(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !title || !description || !country || !city) {
      console.error("All fields are required.");
      // Here you could add user-facing feedback, e.g., a snackbar/alert
      return;
    }

    setIsSubmitting(true);
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
        setOpenSnackbar(true);
      } else {
        // Handle error
        console.error("Upload failed.");
      }
    } catch (error) {
      console.error("An error occurred during upload:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
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
          
          {/* Replace the old dropdowns with the CityCountryInput component */}
          <CityCountryInput
            onCountryChange={setCountry}
            onCityChange={setCity}
            initialCountry={country}
            initialCity={city}
          />

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

          {videoPreviewUrl && (
            <Box sx={{ mt: 2, border: '1px solid lightgray', borderRadius: '4px' }}>
              <video controls width="100%" src={videoPreviewUrl} />
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          </Box>
        </form>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Your news have been submitted for review
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LocalNewsUploadPage;
