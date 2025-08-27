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
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  AudioFile as AudioIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface RecordingResponse {
  episodeId: string;
  message: string;
}

export default function PodcastRecordPage() {
  const router = useRouter();
  const params = useParams();
  const podcastId = params.id as string;
  const { enqueueSnackbar } = useSnackbar();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize recording timer
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);
      
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFinishRecording = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    setError(null);

    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], "recorded-audio.webm", {
        type: "audio/webm",
        lastModified: Date.now(),
      });

      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioFile);

      // Upload file and create episode
      const response = await fetch(`/api/podcast/internal/${podcastId}/episode`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload recording');
      }

      const data: RecordingResponse = await response.json();
      
      // Show success message
      enqueueSnackbar('Recording uploaded successfully!', { 
        variant: 'success',
        autoHideDuration: 3000 
      });

      // Navigate to edit page
      router.push(`/podcast/${podcastId}/episode/${data.episodeId}/edit`);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload recording');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Record Episode
      </Typography>
      
      <Paper sx={{ p: 4, mt: 3 }}>
        {/* Recording Controls */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Step 1: Record Audio
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            {!isRecording && !audioBlob && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<MicIcon />}
                onClick={startRecording}
              >
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<StopIcon />}
                onClick={stopRecording}
              >
                Stop Recording
              </Button>
            )}
            
            {audioBlob && !isRecording && (
              <>
                <Button
                  variant="outlined"
                  startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                  onClick={isPlaying ? pauseRecording : playRecording}
                >
                  {isPlaying ? 'Pause' : 'Play'} Recording
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setRecordingTime(0);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                >
                  Record Again
                </Button>
              </>
            )}
          </Stack>
          
          {/* Recording Timer */}
          {isRecording && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" color="error">
                {formatTime(recordingTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recording in progress...
              </Typography>
            </Box>
          )}
          
          {/* Audio Player */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              style={{ width: '100%', marginTop: 2 }}
            />
          )}
        </Box>

        {/* Recording Preview */}
        {audioBlob && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Step 2: Review Recording
            </Typography>
            
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AudioIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Recorded Audio
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {formatTime(recordingTime)} • Size: {formatFileSize(audioBlob.size)}
                    </Typography>
                  </Box>
                  <CheckIcon color="success" />
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Finish Recording */}
        {audioBlob && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Step 3: Finish Recording
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click the finish button below to create your episode and start editing.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleFinishRecording}
              disabled={isUploading}
              startIcon={isUploading ? <CircularProgress size={20} /> : <CheckIcon />}
              sx={{ minWidth: 200 }}
            >
              {isUploading ? 'Uploading...' : 'Finish & Create Episode'}
            </Button>
            
            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Uploading recording...
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
            Recording Tips
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Find a quiet environment for best audio quality
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Speak clearly and at a consistent volume
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • You can record multiple times until you're satisfied
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • After recording, you'll be able to edit your audio and add episode metadata
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 