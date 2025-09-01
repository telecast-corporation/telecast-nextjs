'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { getAudioProxyUrl } from '@/lib/utils';

export default function TestAudioPage() {
  const [audioUrl, setAudioUrl] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const testAudio = async () => {
    try {
      setError('');
      setSuccess('');
      
      const audio = new Audio(audioUrl);
      
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        console.error('Audio error details:', {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: audio.src,
          errorCode: audio.error?.code,
          errorMessage: audio.error?.message
        });
        setError(`Audio loading failed: ${audio.error?.message || 'Unknown error'}`);
      };
      
      audio.onloadstart = () => {
        console.log('Audio load started');
        setSuccess('Audio load started...');
      };
      
      audio.oncanplay = () => {
        console.log('Audio can play');
        setSuccess('Audio can play!');
      };
      
      audio.onload = () => {
        console.log('Audio loaded successfully');
        setSuccess('Audio loaded successfully!');
      };
      
      await audio.play();
      setSuccess('Audio playing successfully!');
      
    } catch (error) {
      console.error('Test error:', error);
      setError(`Test failed: ${error}`);
    }
  };

  const testProxyAudio = async () => {
    try {
      setError('');
      setSuccess('');
      
      console.log('=== TESTING PROXY AUDIO ===');
      console.log('Original URL:', audioUrl);
      
      const proxyUrl = getAudioProxyUrl(audioUrl);
      setProxyUrl(proxyUrl);
      
      console.log('Proxy URL:', proxyUrl);
      console.log('About to create Audio with proxy URL');
      
      // Test if the proxy URL is accessible
      try {
        const testResponse = await fetch(proxyUrl);
        console.log('Proxy URL test response status:', testResponse.status);
        console.log('Proxy URL test response headers:', Object.fromEntries(testResponse.headers.entries()));
        
        if (!testResponse.ok) {
          throw new Error(`Proxy URL returned status ${testResponse.status}`);
        }
        
        // Test if we can read the response as audio
        const audioBlob = await testResponse.blob();
        console.log('Audio blob size:', audioBlob.size, 'bytes');
        console.log('Audio blob type:', audioBlob.type);
        
        // Create a blob URL to test
        const blobUrl = URL.createObjectURL(audioBlob);
        console.log('Created blob URL:', blobUrl);
        
        // Test the blob URL
        const testAudio = new Audio(blobUrl);
        testAudio.oncanplay = () => {
          console.log('Blob audio can play, duration:', testAudio.duration);
        };
        testAudio.onerror = (e) => {
          console.error('Blob audio error:', e);
        };
        
      } catch (error) {
        console.error('Proxy URL test failed:', error);
        setError(`Proxy URL test failed: ${error}`);
        return;
      }
      
      const audio = new Audio(proxyUrl);
      
      audio.onerror = (e) => {
        console.error('Proxy audio error:', e);
        console.error('Proxy audio error details:', {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: audio.src,
          errorCode: audio.error?.code,
          errorMessage: audio.error?.message
        });
        setError(`Proxy audio loading failed: ${audio.error?.message || 'Unknown error'}`);
      };
      
      audio.onloadstart = () => {
        console.log('Proxy audio load started');
        setSuccess('Proxy audio load started...');
      };
      
      audio.oncanplay = () => {
        console.log('Proxy audio can play');
        setSuccess('Proxy audio can play!');
      };
      
      audio.onload = () => {
        console.log('Proxy audio loaded successfully');
        setSuccess('Proxy audio loaded successfully!');
      };
      
      await audio.play();
      setSuccess('Proxy audio playing successfully!');
      
    } catch (error) {
      console.error('Proxy test error:', error);
      setError(`Proxy test failed: ${error}`);
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Audio Test Page
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Audio Proxy
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This page helps test audio playback with and without the proxy. Enter a Google Cloud Storage URL to test.
        </Typography>
        
        <TextField
          fullWidth
          label="Audio URL"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="https://storage.googleapis.com/telecast-corp-podcast-bucket/podcasts/..."
          sx={{ mb: 2 }}
        />
        
        {proxyUrl && (
          <TextField
            fullWidth
            label="Proxy URL"
            value={proxyUrl}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={testAudio}
            disabled={!audioUrl}
          >
            Test Direct URL
          </Button>
          <Button 
            variant="contained" 
            onClick={testProxyAudio}
            disabled={!audioUrl}
          >
            Test Proxy URL
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Instructions
        </Typography>
        <Typography variant="body2" paragraph>
          1. Enter a Google Cloud Storage URL in the field above
        </Typography>
        <Typography variant="body2" paragraph>
          2. Click "Test Direct URL" to test the original URL
        </Typography>
        <Typography variant="body2" paragraph>
          3. Click "Test Proxy URL" to test through the audio proxy
        </Typography>
        <Typography variant="body2" paragraph>
          4. Check the browser console for detailed error information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The proxy URL should handle CORS issues and provide better compatibility for audio playback.
        </Typography>
      </Paper>
    </Box>
  );
}
