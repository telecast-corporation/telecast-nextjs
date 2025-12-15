'use client';

import React, { useState, useCallback } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle } from 'react-icons/fi';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Link from 'next/link';
import { db } from '@/lib/dexie';

import CityCountryInput from '@/components/CityCountryInput';

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

const EventUploadPage = () => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>('');
  const [openSuccessPopup, setOpenSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setVideoPreviewUrl(event.target.result);
          }
        };
        reader.readAsDataURL(selectedFile);
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
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!file || !title || !description || !country || !city || !category) {
      setErrorMessage('All required fields must be filled.');
      setIsSubmitting(false);
      return;
    }

    try {
      const newNewsItem = {
        title,
        description,
        category,
        videoUrl: videoPreviewUrl || '',
        city,
        country,
        isApproved: false, 
        createdAt: new Date(),
      };

      const id = await db.localNews.add(newNewsItem);

      await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title,
          description,
          category,
          locationCity: city,
          locationCountry: country,
        }),
      });

      setOpenSuccessPopup(true);

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null);
      setVideoPreviewUrl(null);
      setCountry('');
      setCity('');

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <div>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              Upload Event
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Share what's happening in your community.
            </Typography>
          </div>
          <Link href="/events" passHref>
            <Button variant="outlined" size="large">Go to Events</Button>
          </Link>
        </Box>

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
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                variant="filled"
                inputProps={{ maxLength: 1200 }}
                helperText={`${description.length}/1200`}
              />
              <FormControl fullWidth margin="normal" required variant="filled">
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
                disabled={isSubmitting || !file || !title || !description || !country || !city || !category}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog open={openSuccessPopup} onClose={handleCloseSuccessPopup}>
        <DialogTitle>Submission Successful!</DialogTitle>
        <DialogContent dividers>
          <Typography>Your event has been submitted and saved locally.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessPopup}>Close</Button>
          <Link href="/events" passHref>
            <Button color="primary">Go to Events</Button>
          </Link>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventUploadPage;
