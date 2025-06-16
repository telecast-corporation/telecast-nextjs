'use client';

import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { typography, spacing, borderRadius } from '@/styles/typography';

export default function MissionPage() {
  return (
    <Container maxWidth="lg" sx={{ py: spacing.section }}>
      <Paper elevation={0} sx={{ p: spacing.section, borderRadius: borderRadius.large }}>
        <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ ...typography.title, mb: spacing.section }}>
          Our Mission
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ ...typography.heading, mb: spacing.section }}>
          Empowering Content Creators and Enriching Lives Through Audio
        </Typography>

        <Typography variant="body1" paragraph sx={{ ...typography.body, mb: spacing.section }}>
          At Telecast, we believe in the transformative power of audio content. Our mission is to create a platform where content creators can freely express themselves and reach their audience, while listeners can discover and engage with meaningful content that enriches their lives.
        </Typography>

        <Grid container spacing={spacing.section} sx={{ mt: spacing.section }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: spacing.gap, bgcolor: 'background.paper', borderRadius: borderRadius.medium }}>
              <Typography variant="h6" gutterBottom sx={{ ...typography.subheading }}>
                Creator Freedom
              </Typography>
              <Typography variant="body2" sx={{ ...typography.body }}>
                We empower creators with the tools and platform they need to share their voice with the world, free from unnecessary restrictions.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: spacing.gap, bgcolor: 'background.paper', borderRadius: borderRadius.medium }}>
              <Typography variant="h6" gutterBottom sx={{ ...typography.subheading }}>
                Community First
              </Typography>
              <Typography variant="body2" sx={{ ...typography.body }}>
                We foster a vibrant community where listeners and creators can connect, share ideas, and grow together.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: spacing.gap, bgcolor: 'background.paper', borderRadius: borderRadius.medium }}>
              <Typography variant="h6" gutterBottom sx={{ ...typography.subheading }}>
                Innovation
              </Typography>
              <Typography variant="body2" sx={{ ...typography.body }}>
                We continuously innovate to provide the best possible experience for both creators and listeners.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 