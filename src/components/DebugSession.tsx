'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

export default function DebugSession() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [editSession, setEditSession] = useState<string | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('editSession');
    setEditSession(session);
    
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setSessionData(parsed);
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
  }, []);

  const clearSession = () => {
    sessionStorage.removeItem('editSession');
    setEditSession(null);
    setSessionData(null);
  };

  const testAudioUrl = async (url: string) => {
    try {
      console.log('Testing audio URL:', url);
      const response = await fetch(url);
      console.log('Audio URL test response:', response.status, response.statusText);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Audio blob size:', blob.size, 'bytes');
        console.log('Audio blob type:', blob.type);
        return true;
      } else {
        console.error('Audio URL returned error status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Audio URL test error:', error);
      return false;
    }
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Debug Session Storage
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Edit Session Raw: {editSession ? 'Found' : 'Not found'}
        </Typography>
      </Box>

      {sessionData && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Parsed Session Data:
          </Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </Box>
      )}

      {sessionData?.tempUrl && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Audio URL Test:
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => testAudioUrl(sessionData.tempUrl)}
          >
            Test Audio URL
          </Button>
        </Box>
      )}

      <Button variant="contained" onClick={clearSession} color="error">
        Clear Session
      </Button>
    </Paper>
  );
} 