
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ApprovedPage = () => {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          News Item Approved
        </Typography>
        <Typography variant="body1">
          The local news item has been successfully approved and is now live.
        </Typography>
      </Box>
    </Container>
  );
};

export default ApprovedPage;
