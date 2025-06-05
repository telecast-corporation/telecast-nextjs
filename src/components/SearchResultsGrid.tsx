import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  author?: string;
  duration?: string;
  url?: string;
  episodes?: any[];
}

interface SearchResultsGridProps {
  results: SearchResult[];
  onPodcastClick: (result: SearchResult) => void;
  onVideoClick: (result: SearchResult) => void;
  onMusicClick: (result: SearchResult) => void;
  onBookClick: (result: SearchResult) => void;
}

const SearchResultsGrid: React.FC<SearchResultsGridProps> = ({ results, onPodcastClick, onVideoClick, onMusicClick, onBookClick }) => (
  <Grid container spacing={3}>
    {results.map((result) => (
      <Grid item xs={12} sm={6} md={4} key={result.id}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
          onClick={() => {
            switch (result.category) {
              case 'podcasts':
                onPodcastClick(result);
                break;
              case 'videos':
                onVideoClick(result);
                break;
              case 'music':
                onMusicClick(result);
                break;
              case 'books':
                onBookClick(result);
                break;
            }
          }}
        >
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%',
              bgcolor: 'grey.200',
            }}
          >
            {result.image ? (
              <img
                src={result.image}
                alt={result.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : null}
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h6" component="h2" noWrap>
              {result.title}
            </Typography>
            {result.author && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {result.author}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {result.description}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default SearchResultsGrid; 