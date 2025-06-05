'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box,
  Button,
  IconButton,
  useTheme,
  Divider
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRouter } from 'next/navigation';

interface TrendingItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'podcast' | 'video' | 'music' | 'book';
  author: string;
}

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const [trendingContent, setTrendingContent] = useState<Record<string, TrendingItem[]>>({
    podcast: [],
    video: [],
    music: [],
    book: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockData: Record<string, TrendingItem[]> = {
      podcast: [
        {
          id: '1',
          title: 'The Future of AI',
          description: 'Exploring the latest developments in artificial intelligence',
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
          category: 'podcast',
          author: 'Tech Insights'
        },
        {
          id: '2',
          title: 'Morning Meditation',
          description: 'Start your day with peace and mindfulness',
          imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
          category: 'podcast',
          author: 'Mindful Living'
        },
        {
          id: '6',
          title: 'Business Success',
          description: 'Strategies for growing your business',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
          category: 'podcast',
          author: 'Business Pro'
        }
      ],
      video: [
        {
          id: '3',
          title: 'Cooking Masterclass',
          description: 'Learn to cook like a professional chef',
          imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
          category: 'video',
          author: 'Chef Sarah'
        },
        {
          id: '7',
          title: 'Travel Vlog: Japan',
          description: 'Exploring the hidden gems of Tokyo',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
          category: 'video',
          author: 'Travel Explorer'
        },
        {
          id: '8',
          title: 'Fitness Journey',
          description: 'Transform your body in 30 days',
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
          category: 'video',
          author: 'Fit Life'
        }
      ],
      music: [
        {
          id: '4',
          title: 'Summer Vibes',
          description: 'The hottest tracks for your summer playlist',
          imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
          category: 'music',
          author: 'DJ Cool'
        },
        {
          id: '9',
          title: 'Chill Beats',
          description: 'Relaxing melodies for your study session',
          imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
          category: 'music',
          author: 'LoFi Master'
        },
        {
          id: '10',
          title: 'Rock Classics',
          description: 'The greatest rock hits of all time',
          imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
          category: 'music',
          author: 'Rock Radio'
        }
      ],
      book: [
        {
          id: '5',
          title: 'The Art of Programming',
          description: 'Master the fundamentals of coding',
          imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
          category: 'book',
          author: 'Code Master'
        },
        {
          id: '11',
          title: 'Mindful Living',
          description: 'A guide to finding inner peace',
          imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
          category: 'book',
          author: 'Zen Master'
        },
        {
          id: '12',
          title: 'Financial Freedom',
          description: 'Steps to achieve financial independence',
          imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e',
          category: 'book',
          author: 'Money Expert'
        }
      ]
    };
    setTrendingContent(mockData);
    setLoading(false);
  }, []);

  const handleItemClick = (item: TrendingItem) => {
    router.push(`/${item.category}/${item.id}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'podcast':
        return theme.palette.primary.main; // Vibrant Orange
      case 'video':
        return theme.palette.secondary.main; // Vibrant Orange (Secondary)
      case 'music':
        return theme.palette.tertiary.main; // Hunyadi Yellow
      case 'book':
        return theme.palette.info.main; // Robin Egg Blue
      default:
        return theme.palette.primary.main;
    }
  };

  const renderCategorySection = (category: string, items: TrendingItem[]) => {
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    return (
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ 
            color: getCategoryColor(category),
            fontWeight: 600
          }}>
            Trending {categoryTitle}
          </Typography>
          <Button 
            variant="text" 
            onClick={() => router.push(`/search?type=${category}`)}
            sx={{ 
              color: getCategoryColor(category),
              '&:hover': {
                backgroundColor: `${getCategoryColor(category)}10`
              }
            }}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleItemClick(item)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.imageUrl}
                    alt={item.title}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: getCategoryColor(item.category),
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {item.category}
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By {item.author}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
          fontWeight: 700,
            mb: 2,
            color: 'primary.main',
          }}
        >
          Your Gateway to Amazing Content
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Discover podcasts, videos, music, and books that inspire and entertain
        </Typography>
      </Box>

      {Object.entries(trendingContent).map(([category, items]) => (
        <Box key={category}>
          {renderCategorySection(category, items)}
          {category !== 'book' && <Divider sx={{ my: 4 }} />}
        </Box>
      ))}
    </Container>
  );
}
