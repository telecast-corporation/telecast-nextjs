'use client';

import React from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import Link from 'next/link';

const LocalNewsAdminPage = () => {
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Local News Administration
        </Typography>
        <Typography paragraph>
          Welcome to the Local News administration page. Here you can manage and review user-submitted content.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/admin/local-news/approved"
          >
            View Approved Content
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            component={Link}
            href="/admin/local-news/rejected"
          >
            View Rejected Content
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            component={Link}
            href="/events/upload"
          >
            Upload Event
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LocalNewsAdminPage;
