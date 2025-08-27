'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  AudioFile as AudioIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface UploadResponse {
  episodeId: string;
  message: string;
}

export default function PodcastUploadPage() {
  const router = useRouter();
  const params = useParams();
  const podcastId = params.id as string;
  const { enqueueSnackbar } = useSnackbar();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('Upload page loaded with podcastId:', podcastId);
    console.log('File input ref:', fileInputRef.current);
  }, [podcastId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file');
        return;
      }
      
      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleChooseFile = () => {
    console.log('Choose file button clicked');
    if (fileInputRef.current) {
      console.log('File input ref found, triggering click');
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null');
      // Fallback: create a temporary file input
      const tempInput = document.createElement('input');
      tempInput.type = 'file';
      tempInput.accept = 'audio/*';
      tempInput.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          handleFileSelect({ target } as React.ChangeEvent<HTMLInputElement>);
        }
      };
      tempInput.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('audio', selectedFile);

      // Upload file and create episode
      const response = await fetch(`/api/podcast/internal/${podcastId}/episode`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data: UploadResponse = await response.json();
      
      // Show success message
      enqueueSnackbar('File uploaded successfully!', { 
        variant: 'success',
        autoHideDuration: 3000 
      });

      // Navigate to edit page
      router.push(`/podcast/${podcastId}/episode/${data.episodeId}/edit`);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Upload Episode
      </Typography>
      
      <Paper sx={{ p: 4, mt: 3 }}>
        {/* File Selection */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Step 1: Select Audio File
          </Typography>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleChooseFile}
            sx={{ mb: 2 }}
          >
            Choose Audio File
          </Button>
          
          {selectedFile && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AudioIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </Typography>
                  </Box>
                  <CheckIcon color="success" />
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Upload Button */}
        {selectedFile && (
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={isUploading}
              startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
              sx={{ minWidth: 200 }}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            
            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Uploading {selectedFile.name}...
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Help Text */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Supported Formats
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="MP3" size="small" />
            <Chip label="WAV" size="small" />
            <Chip label="M4A" size="small" />
            <Chip label="FLAC" size="small" />
            <Chip label="OGG" size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Maximum file size: 100MB. After upload, you'll be able to edit your audio and add episode metadata.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 