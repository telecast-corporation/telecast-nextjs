'use client';

import { useState } from 'react';
import { Button, Box, Typography, Card, CardContent } from '@mui/material';

export default function TestAudiobooks() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAudiobookSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'fiction',
          types: ['audiobook'],
          maxResults: 5,
        }),
      });

      const data = await response.json();
      console.log('🔍 Test audiobook search results:', data);
      setResults(data);
    } catch (error) {
      console.error('🔍 Test error:', error);
      setResults({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const getContentUrl = (result: any) => {
    switch (result.type) {
      case 'audiobook':
        const audiobookUrl = result.audibleUrl || result.url || `https://www.audible.ca/search?keywords=${encodeURIComponent(result.title)}`;
        console.log('🎧 Audiobook URL Debug:', { 
          title: result.title, 
          audibleUrl: result.audibleUrl, 
          url: result.url, 
          finalUrl: audiobookUrl,
          hasAudibleUrl: !!result.audibleUrl,
          hasUrl: !!result.url,
          isExternal: audiobookUrl.startsWith('http'),
          resultKeys: Object.keys(result)
        });
        return audiobookUrl;
      default:
        return result.url || '#';
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Audiobook URL Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testAudiobookSearch}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? 'Testing...' : 'Test Audiobook Search'}
      </Button>

      {results && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Results:
          </Typography>
          
          {results.error ? (
            <Typography color="error">{results.error}</Typography>
          ) : (
            <Box>
              <Typography variant="body2" gutterBottom>
                Total results: {results.total}
              </Typography>
              
              {results.results?.map((result: any, index: number) => {
                const contentUrl = getContentUrl(result);
                const isExternal = contentUrl.startsWith('http');
                
                return (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{result.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {result.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Author: {result.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Original URL: {result.url}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Audible URL: {result.audibleUrl}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Final URL: {contentUrl}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Is External: {isExternal ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        All Keys: {Object.keys(result).join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
} 