
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const RejectedPage = () => {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          News Item Rejected
        </Typography>
        <Typography variant="body1">
          The local news item has been rejected and will not be published.
        </Typography>
      </Box>
    </Container>
  );
};

export default RejectedPage;
