'use client';

import { Container, Typography, Box, Paper, Grid } from '@mui/material';

export default function MissionPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: 6, borderRadius: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
          Our Mission
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          Empowering Content Creators and Enriching Lives Through Audio
        </Typography>

        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          At Telecast, we believe in the transformative power of audio content. Our mission is to create a platform where content creators can freely express themselves and reach their audience, while listeners can discover and engage with meaningful content that enriches their lives.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Creator Freedom
              </Typography>
              <Typography variant="body2">
                We empower creators with the tools and platform they need to share their voice with the world, free from unnecessary restrictions.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Community First
              </Typography>
              <Typography variant="body2">
                We foster a vibrant community where listeners and creators can connect, share ideas, and grow together.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Innovation
              </Typography>
              <Typography variant="body2">
                We continuously innovate to provide the best possible experience for both creators and listeners.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 