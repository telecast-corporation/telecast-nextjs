'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/Pagination';

interface TrendingItem {
  id: string;
  type: 'video' | 'music' | 'book' | 'news';
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  views?: string;
  publishedAt?: string;
  artist?: string;
  album?: string;
  author?: string;
  publishedDate?: string;
  rating?: number;
  source?: string;
  sourceUrl?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trending-tabpanel-${index}`}
      aria-labelledby={`trending-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper to ensure HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

export default function TrendingPage() {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendingContent, setTrendingContent] = useState<{
    videos: TrendingItem[];
    music: TrendingItem[];
    books: TrendingItem[];
    news: TrendingItem[];
  }>({ videos: [], music: [], books: [], news: [] });
  const [newsPage, setNewsPage] = useState(1);
  const [newsPagination, setNewsPagination] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingContent = async () => {
      try {
        const response = await fetch('/api/trending');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch trending content');
        }

        setTrendingContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingContent();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleItemClick = (item: TrendingItem) => {
    switch (item.type) {
      case 'video':
        router.push(`/video/${item.id}`);
        break;
      case 'music':
        router.push(`/music/${item.id}`);
        break;
      case 'book':
        router.push(`/book/${item.id}`);
        break;
      case 'news':
        if (item.url) {
          window.open(item.url, '_blank');
        }
        break;
    }
  };

  const handleNewsPageChange = (page: number) => {
    setNewsPage(page);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Trending Now
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} aria-label="trending content tabs">
          <Tab label="Videos" />
          <Tab label="Music" />
          <Tab label="Books" />
          <Tab label="News" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Grid container spacing={3}>
          {trendingContent.videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <Card>
                <CardActionArea onClick={() => handleItemClick(video)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={video.thumbnail}
                    alt={video.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {video.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${Number(video.views).toLocaleString()} views`}
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={3}>
          {trendingContent.music.map((track) => (
            <Grid item xs={12} sm={6} md={4} key={track.id}>
              <Card>
                <CardActionArea onClick={() => handleItemClick(track)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={track.thumbnail}
                    alt={track.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {track.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {track.artist}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {track.album}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Grid container spacing={3}>
          {trendingContent.books.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardActionArea onClick={() => handleItemClick(book)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={ensureHttps(book.thumbnail)}
                    alt={book.title}
                    sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {book.author}
                    </Typography>
                    {book.rating && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label={`Rating: ${book.rating.toFixed(1)}`}
                        />
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Grid container spacing={3}>
          {trendingContent.news
            .slice((newsPage - 1) * 20, newsPage * 20)
            .map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id}>
              <Card>
                <CardActionArea onClick={() => handleItemClick(article)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.thumbnail}
                    alt={article.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {article.description}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {article.author}
                      </Typography>
                      {article.source && (
                        <Chip
                          size="small"
                          label={article.source}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* News Pagination */}
        {trendingContent.news.length > 20 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              currentPage={newsPage}
              totalPages={Math.ceil(trendingContent.news.length / 20)}
              onPageChange={handleNewsPageChange}
              showingSummary={{
                start: (newsPage - 1) * 20 + 1,
                end: Math.min(newsPage * 20, trendingContent.news.length),
                total: trendingContent.news.length,
              }}
            />
          </Box>
        )}
      </TabPanel>
    </Container>
  );
} 