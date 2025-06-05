'use client';

import { Container, Typography, Box, TextField, Button, Grid } from '@mui/material';

export default function Contact() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 10 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          Have questions or feedback? We'd love to hear from you.
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Message"
              variant="outlined"
              multiline
              rows={4}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" size="large">
              Send Message
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 