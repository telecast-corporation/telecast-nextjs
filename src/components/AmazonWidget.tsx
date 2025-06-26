import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';

interface AmazonWidgetProps {
  asin?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  affiliateTag?: string;
  searchQuery?: string;
}

export default function AmazonWidget({
  asin,
  title,
  description,
  imageUrl,
  price,
  affiliateTag = 'telecastca-20',
  searchQuery
}: AmazonWidgetProps) {
  // Create Amazon affiliate link
  const createAmazonLink = () => {
    if (asin) {
      // Direct product link with ASIN
      return `https://www.amazon.com/dp/${asin}?tag=${affiliateTag}`;
    } else if (searchQuery) {
      // Search link
      const encodedQuery = encodeURIComponent(searchQuery);
      return `https://www.amazon.com/s?k=${encodedQuery}&tag=${affiliateTag}`;
    } else {
      // Fallback to title search
      const encodedTitle = encodeURIComponent(title);
      return `https://www.amazon.com/s?k=${encodedTitle}&tag=${affiliateTag}`;
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        backgroundColor: '#fafafa',
        maxWidth: 300,
        mx: 'auto',
      }}
    >
      {imageUrl && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img
            src={imageUrl}
            alt={title}
            style={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: 200,
              objectFit: 'contain',
            }}
          />
        </Box>
      )}
      
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      
      {price && (
        <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
          {price}
        </Typography>
      )}
      
      <Button
        variant="contained"
        startIcon={<ShoppingCartIcon />}
        onClick={() => window.open(createAmazonLink(), '_blank')}
        sx={{
          backgroundColor: '#FF9900',
          color: '#000',
          fontWeight: 'bold',
          width: '100%',
          '&:hover': {
            backgroundColor: '#E68900',
          },
        }}
      >
        View on Amazon
      </Button>
      
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textAlign: 'center',
          mt: 1,
          fontSize: '0.7rem',
          opacity: 0.7,
        }}
      >
        *Affiliate link
      </Typography>
    </Box>
  );
}

// Amazon Associates Product Link Component
export function AmazonProductLink({ asin, affiliateTag = 'telecastca-20' }: { asin: string; affiliateTag?: string }) {
  const amazonUrl = `https://www.amazon.com/dp/${asin}?tag=${affiliateTag}`;
  
  return (
    <a
      href={amazonUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Button
        variant="outlined"
        startIcon={<ShoppingCartIcon />}
        sx={{
          borderColor: '#FF9900',
          color: '#FF9900',
          '&:hover': {
            borderColor: '#E68900',
            backgroundColor: '#FFF8E1',
          },
        }}
      >
        Buy on Amazon
      </Button>
    </a>
  );
}

// Amazon Associates Search Link Component
export function AmazonSearchLink({ query, affiliateTag = 'telecastca-20' }: { query: string; affiliateTag?: string }) {
  const encodedQuery = encodeURIComponent(query);
  const amazonUrl = `https://www.amazon.com/s?k=${encodedQuery}&tag=${affiliateTag}`;
  
  return (
    <a
      href={amazonUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Button
        variant="outlined"
        startIcon={<ShoppingCartIcon />}
        sx={{
          borderColor: '#FF9900',
          color: '#FF9900',
          '&:hover': {
            borderColor: '#E68900',
            backgroundColor: '#FFF8E1',
          },
        }}
      >
        Search on Amazon
      </Button>
    </a>
  );
} 