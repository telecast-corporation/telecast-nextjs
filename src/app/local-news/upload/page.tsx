
'use client';

import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle } from 'react-icons/fi';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import CityCountryInput from '@/components/CityCountryInput';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateUserById } from '@/lib/auth0-user';

const LocalNewsUploadPage = () => {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [openSuccessPopup, setOpenSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setVideoPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setErrorMessage('Please upload a valid video file.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': [],
    },
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setVideoPreviewUrl(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!file || !title || !description || !country || !city) {
      setErrorMessage('All required fields must be filled.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('locationCity', city);
    formData.append('locationCountry', country);

    try {
      const authUser = await getOrCreateUserById(user?.id);
      if (!authUser || !authUser.id) {
        setErrorMessage("Authentication failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
      formData.append('userId', authUser.id);

      const uploadResponse = await fetch('/api/local-news', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video.');
      }

      const uploadData = await uploadResponse.json();
      const { videoUrl } = uploadData;

      const adminSubmissionResponse = await fetch('/api/admin/local-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          locationCity: city,
          locationCountry: country
        }),
      });

      if (!adminSubmissionResponse.ok) {
        throw new Error('Failed to submit for approval.');
      }

      setOpenSuccessPopup(true);

      setTitle("");
      setDescription("");
      setFile(null);
      setVideoPreviewUrl(null);
      setCountry("");
      setCity("");

    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setOpenSuccessPopup(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper elevation={12} sx={{ p: { xs: 2, sm: 4, md: 6 }, borderRadius: 4, background: 'linear-gradient(145deg, #f0f2f5, #ffffff)' }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 2 }}>
          Share Your Story
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 5 }}>
          Become a citizen journalist and share what's happening in your community.
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 500}}>Story Details</Typography>
              <TextField
                label="Catchy Title"
                fullWidth
                margin="normal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="filled"
              />
              <TextField
                label="Detailed Description"
                fullWidth
                margin="normal"
                multiline
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                variant="filled"
              />
              <CityCountryInput
                onCountryChange={setCountry}
                onCityChange={setCity}
                initialCountry={country}
                initialCity={city}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>Upload Video</Typography>
              {videoPreviewUrl ? (
                <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                  <video src={videoPreviewUrl} controls width="100%" style={{ display: 'block' }} />
                  <IconButton
                    onClick={removeFile}
                    sx={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', '&:hover': { background: 'rgba(0,0,0,0.8)' } }}
                  >
                    <FiXCircle color="white" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                    borderRadius: 2,
                    p: 6,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border .24s ease-in-out',
                    backgroundColor: isDragActive ? 'rgba(0, 118, 255, 0.05)' : '#fafafa'
                  }}
                >
                  <input {...getInputProps()} />
                  <FiUploadCloud size={48} color={theme.palette.primary.main} />
                  <Typography sx={{ mt: 2 }}>
                    {isDragActive ? 'Drop the files here ...' : 'Drag & drop a video file here, or click to select a file'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Max file size: 500MB</Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ mt: 4, py: 2, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: 2 }}
                disabled={isSubmitting || !file || !title || !description || !country || !city}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit for Review'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog open={openSuccessPopup} onClose={handleCloseSuccessPopup}>
        <DialogTitle>Submission Successful!</DialogTitle>
        <DialogContent dividers>
          <Typography>Your local news item has been submitted for review. You will be notified once it has been approved.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessPopup}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LocalNewsUploadPage;
