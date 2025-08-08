'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import {
  CloudUpload as CloudUploadIcon,
  Mic as MicIcon,
  Radio as RadioIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export default function EpisodeUpload() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const steps = [
    {
      label: 'Record',
      description: 'Create your audio content using our professional editor',
      icon: <MicIcon />,
      completed: true,
    },
    {
      label: 'Upload',
      description: 'Upload your audio file',
      icon: <CloudUploadIcon />,
      completed: false,
    },
    {
      label: 'Broadcast',
      description: 'Add metadata and distribute to podcast platforms',
      icon: <RadioIcon />,
      completed: false,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError('');
    }
  };

  const handleContinue = async () => {
    if (!audioFile) {
      setError('Please upload an audio file first');
      return;
    }

    setLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = () => {
        // Store file data in localStorage
        localStorage.setItem('uploadedAudioData', reader.result as string);
        localStorage.setItem('uploadedAudioFile', JSON.stringify({
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type,
          lastModified: audioFile.lastModified
        }));

        // Navigate to finalize page
        router.push('/finalize');
      };
      reader.readAsDataURL(audioFile);
    } catch (error) {
      setError('Error saving file. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      {/* Progress Stepper */}
      <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 700, mb: 3, textAlign: 'center' }}>
            Upload Your Audio File
          </Typography>
          
          <Stepper orientation="horizontal" sx={{ mb: 3 }}>
            {steps.map((step, index) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel
                  icon={step.icon}
                  sx={{
                    '& .MuiStepLabel-iconContainer': {
                      color: step.completed ? theme.palette.primary.main : 'text.secondary',
                    },
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#ff6b35', fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Upload Your Audio File
        </Typography>

        <Box sx={{ textAlign: 'center' }}>
          {!audioFile && (
            <Box sx={{ mb: 3, p: 3, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2, border: '2px dashed rgba(33, 150, 243, 0.3)' }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                Upload your audio file
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please upload the audio file you created in the editor. Supported formats: MP3, WAV, M4A
              </Typography>
            </Box>
          )}

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              py: 3, 
              px: 4,
              borderStyle: 'dashed',
              borderWidth: 2,
              minWidth: 300,
              height: 120,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: 'rgba(0,0,0,0.02)',
              }
            }}
          >
            {audioFile ? `Selected: ${audioFile.name}` : 'Click to select audio file'}
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              hidden
            />
          </Button>

          {audioFile && (
            <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
              <Typography variant="body1" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
                ✓ Audio file loaded successfully
              </Typography>
              <Typography variant="body2" color="text.secondary">
                File: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1, border: '1px solid rgba(244, 67, 54, 0.3)' }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/record')}
              sx={{ px: 4, py: 1.5 }}
            >
              Back to Record
            </Button>
            
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={!audioFile || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              sx={{ 
                px: 6, 
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                background: theme.palette.primary.main,
                '&:hover': {
                  background: theme.palette.primary.dark,
                }
              }}
            >
              {loading ? 'Saving...' : 'Continue to Finalize'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 