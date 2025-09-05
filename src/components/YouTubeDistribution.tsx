'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  YouTube as YouTubeIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

interface YouTubeDistributionProps {
  podcastId: string;
  disabled?: boolean;
}

export default function YouTubeDistribution({ podcastId, disabled = false }: YouTubeDistributionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rssUrl, setRssUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [instructions, setInstructions] = useState<any>(null);

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setRssUrl(null);
    setInstructions(null);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setRssUrl(null);
    setInstructions(null);
    setCopied(false);
  };

  const handleDistribute = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/podcast/${podcastId}/youtube`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup YouTube distribution');
      }

      const data = await response.json();
      setRssUrl(data.instructions.rssFeedUrl);
      setInstructions(data.instructions);

    } catch (error) {
      console.error('Error setting up YouTube distribution:', error);
      setError(error instanceof Error ? error.message : 'Failed to setup YouTube distribution');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRssUrl = async () => {
    if (rssUrl) {
      try {
        await navigator.clipboard.writeText(rssUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy RSS URL:', error);
      }
    }
  };

  const handleOpenYouTubeStudio = () => {
    window.open('https://studio.youtube.com', '_blank');
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<YouTubeIcon />}
        onClick={handleOpen}
        disabled={disabled}
        sx={{
          borderColor: '#FF0000',
          color: '#FF0000',
          '&:hover': {
            borderColor: '#CC0000',
            backgroundColor: 'rgba(255, 0, 0, 0.04)',
          },
        }}
      >
        Distribute to YouTube
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <YouTubeIcon sx={{ color: '#FF0000' }} />
          Distribute to YouTube
        </DialogTitle>

        <DialogContent>
          {!rssUrl && !loading && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Distribute your podcast to YouTube using RSS feed integration. YouTube will automatically 
                create videos using your podcast cover art as the video thumbnail.
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>How it works:</strong> YouTube will automatically convert your audio episodes 
                  into videos using your podcast cover image. This allows you to reach YouTube's massive 
                  audience without creating separate video content.
                </Typography>
              </Alert>

              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> You need at least one published episode to distribute to YouTube. 
                  Make sure to publish your episode first using the "Publish Episode" button.
                </Typography>
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Setting up YouTube distribution...
              </Typography>
            </Box>
          )}

          {rssUrl && instructions && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Success!</strong> Your RSS feed is ready for YouTube distribution.
                </Typography>
              </Alert>

              <Typography variant="h6" gutterBottom>
                Your RSS Feed URL
              </Typography>
              
              <TextField
                fullWidth
                value={rssUrl}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleCopyRssUrl}
                        edge="end"
                        color={copied ? 'success' : 'default'}
                      >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Typography variant="h6" gutterBottom>
                Distribution Instructions
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h6" color="primary">1</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Copy the RSS feed URL above"
                    secondary="Click the copy button to copy the URL to your clipboard"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h6" color="primary">2</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Go to YouTube Studio"
                    secondary="Open YouTube Studio in a new tab"
                  />
                  <IconButton onClick={handleOpenYouTubeStudio} edge="end">
                    <OpenInNewIcon />
                  </IconButton>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h6" color="primary">3</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Navigate to Content → Podcasts"
                    secondary="In YouTube Studio, go to the Content section and select Podcasts"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h6" color="primary">4</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Add your podcast"
                    secondary="Click 'Add podcast' and paste your RSS feed URL"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h6" color="primary">5</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="YouTube will create videos automatically"
                    secondary="YouTube will use your podcast cover art to create videos for each episode"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h6" color="primary">6</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Your episodes will appear on YouTube and YouTube Music"
                    secondary="Once processed, your episodes will be available on both platforms"
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Podcast Information:
                </Typography>
                <Typography variant="body2">
                  <strong>Title:</strong> {instructions.podcastTitle}
                </Typography>
                <Typography variant="body2">
                  <strong>Episodes:</strong> {instructions.episodeCount} published episode(s)
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {!rssUrl && !loading && (
            <>
              <Button onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleDistribute}
                variant="contained"
                startIcon={<YouTubeIcon />}
                sx={{
                  backgroundColor: '#FF0000',
                  '&:hover': {
                    backgroundColor: '#CC0000',
                  },
                }}
              >
                Get RSS Feed
              </Button>
            </>
          )}

          {rssUrl && (
            <Button onClick={handleClose} variant="contained">
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
