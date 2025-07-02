'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Refresh as RefreshIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function AudioRecorder() {
  const theme = useTheme();
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Gradient backgrounds for light/dark mode
  const gradientBg = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
    : 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)';
  const glassBg = theme.palette.mode === 'dark'
    ? 'rgba(40, 44, 52, 0.85)'
    : 'rgba(255, 255, 255, 0.85)';
  const glassBorder = theme.palette.mode === 'dark'
    ? '1.5px solid rgba(255,255,255,0.08)'
    : '1.5px solid rgba(200,200,200,0.18)';

  // AudioMass editor URL
  const audioMassUrl = "https://audiomass.co/";

  const handleClearEditor = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: gradientBg,
        p: { xs: 1, sm: 3 },
        transition: 'background 0.5s',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: { xs: 1, sm: 2 },
          maxWidth: 1600,
          width: '100%',
          borderRadius: 2,
          background: glassBg,
          border: glassBorder,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'background 0.5s, border 0.5s',
          minHeight: { xs: '85vh', sm: '90vh' },
        }}
      >
        {/* Info Banner and Clear Editor Button on the same line */}
        <Box sx={{
          mb: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.10)' : 'rgba(33,150,243,0.10)',
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            borderRadius: 1,
            px: 2.5,
            py: 1.2,
            boxShadow: '0 1px 6px rgba(33,150,243,0.04)',
            flex: 1,
            mr: 2,
            minWidth: 0,
          }}>
            <InfoOutlinedIcon color="primary" sx={{ mr: 1.5, fontSize: 22, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'inherit', fontWeight: 500, fontSize: 15, lineHeight: 1.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Your audio will be hosted on <b>Telecast</b> and, with our broadcasting service, can be distributed to <b>Spotify</b>, <b>Apple Podcasts</b>, <b>Google Podcasts</b>, and more.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleClearEditor}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              fontSize: 14,
              borderWidth: 1.5,
              minWidth: 120,
              '&:hover': {
                borderWidth: 1.5,
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Clear Editor
          </Button>
        </Box>

        {/* Top Next Step: Broadcast Step Bar */}
        <Box sx={{
          mb: 3,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.03)' : 'transparent',
          px: { xs: 0, sm: 1 },
          py: { xs: 0.5, sm: 1 },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: theme.palette.primary.main,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 18,
              mr: 1,
            }}>
              2
            </Box>
            <Typography variant="body1" color="text.primary" sx={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 16 }}>
              Ready to share? Go to <b>Broadcast</b> after editing.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            href="/broadcast"
            sx={{
              fontWeight: 700,
              fontSize: 16,
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
              textTransform: 'none',
            }}
          >
            Next: Broadcast
          </Button>
        </Box>

        {/* Embedded AudioMass Editor */}
        <Box sx={{
          flex: 1,
          minHeight: { xs: '75vh', sm: '82vh' },
          borderRadius: 1,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'relative',
        }}>
          {!iframeLoaded && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,32,38,0.85)' : 'rgba(255,255,255,0.85)',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CircularProgress size={48} color="primary" />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                Loading professional editor...
              </Typography>
            </Box>
          )}
          <iframe
            key={iframeKey}
            src={audioMassUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              minHeight: '75vh',
              background: 'transparent',
            }}
            title="AudioMass Professional Audio Editor"
            allow="microphone; camera; fullscreen"
            allowFullScreen
            onLoad={() => setIframeLoaded(true)}
          />
        </Box>

        {/* Minimal Footer */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          mt: 1,
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'inherit', fontWeight: 500, fontSize: 16 }}>
            Powered by AudioMass
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}