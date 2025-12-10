
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
  Paper
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import CityCountryInput from '@/components/CityCountryInput'; // Import the new component
import { useAuth } from '@/contexts/AuthContext'; // To get user location
import { getOrCreateUser } from '@/lib/auth0-user';

const LocalNewsUploadPage = () => {
  const theme = useTheme();
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
        setTitle("");
        setDescription("");
        setFile(null);
        setVideoPreviewUrl(null);
        setCountry("");
        setCity("");

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
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ my: 4, p: 4, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
          Upload Local News
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Title"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="filled"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="filled"
            />
          </Box>
          
          <CityCountryInput
            onCountryChange={setCountry}
            onCityChange={setCity}
            initialCountry={country}
            initialCity={city}
          />

          <Box sx={{ mt: 2, p: 2, border: `2px dashed ${theme.palette.divider}`, borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
            <input
              accept="video/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button variant="text" component="span" sx={{ color: 'primary.main' }}>
                Choose Video
              </Button>
              {file && <Typography variant="body2" sx={{ mt: 1 }}>{file.name}</Typography>}
            </label>
          </Box>

          {videoPreviewUrl && (
            <Box sx={{ mt: 2, borderRadius: '8px', overflow: 'hidden' }}>
              <video controls width="100%" src={videoPreviewUrl} style={{ display: 'block' }}/>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} fullWidth sx={{ py: 1.5, borderRadius: '25px', fontWeight: 'bold' }}>
              {isSubmitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Submit"}
            </Button>
          </Box>
        </form>
      </Paper>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', boxShadow: 6 }}>
          Your news have been submitted for review
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LocalNewsUploadPage;
