'use client';

import React from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/dexie';

const LocalNewsAdminPage = () => {
  const localNews = useLiveQuery(() =>
    db.localNews.filter(news => news.isApproved !== true && news.isRejected !== true).toArray()
  );

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Local News Administration
        </Typography>
        <Typography paragraph>
          Welcome to the Local News administration page. Here you can manage and review user-submitted content.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Pending News
          </Typography>
          {!localNews ? (
            <CircularProgress />
          ) : localNews.length === 0 ? (
            <Alert severity="info">No pending news articles.</Alert>
          ) : (
            <List>
              {localNews.map((news) => (
                <ListItem key={news.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText primary={news.title} secondary={news.category} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      component={Link}
                      href={`/admin/local-news/${news.id}`}
                    >
                      View
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
