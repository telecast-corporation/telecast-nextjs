import axios from 'axios';

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Helper function to ensure HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

// Export the search function so it can be called directly
export async function searchAudible(query: string, maxResults: number = 40) {
  try {
    console.log('🔍 Scraping Audible for query:', query);

    // Construct Audible search URL with better parameters (using audible.ca)
    const searchUrl = `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}&ref=a_search_c1_header_0_1_1_1&pf_rd_p=1d79b443-2f1d-43a3-b1dc-31a2cd242566&pf_rd_r=1&pf_rd_s=center-1&pf_rd_t=101&pf_rd_i=audible-search&pf_rd_m=A2ZO8JX97D5MN9&pf_rd_q=1`;

    // Fetch the search page with better headers for production
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      timeout: 20000,
      maxRedirects: 5,
    });

    const html = response.data;
    const books: any[] = [];

    console.log('🔍 Parsing Audible search results...');

    // Extract audiobook links using regex - try multiple patterns
    const audiobookLinkPatterns = [
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*class="[^"]*bc-link[^"]*"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*data-bc-link[^>]*>([^<]+)<\/a>/gi,
    ];

    let matches: RegExpMatchArray[] = [];
    for (const pattern of audiobookLinkPatterns) {
      const patternMatches = [...html.matchAll(pattern)];
      if (patternMatches.length > 0) {
        matches = patternMatches;
        console.log(`🔍 Found ${matches.length} audiobooks with pattern`);
        break;
      }
    }

    if (matches.length === 0) {
      console.log('🔍 No audiobooks found, trying fallback pattern');
      // Fallback: look for any link containing /pd/
      const fallbackPattern = /href="(\/pd\/[^"]*)"[^>]*>([^<]+)</gi;
      matches = [...html.matchAll(fallbackPattern)];
    }

    console.log(`🔍 Processing ${Math.min(matches.length, maxResults)} audiobooks`);

    for (let i = 0; i < Math.min(matches.length, maxResults); i++) {
      try {
        const match = matches[i];
        const audibleUrl = match[1];
        const title = match[2].trim();

        if (!title || title.length < 3) continue;

        // Try to extract additional info from surrounding HTML
        const contextStart = Math.max(0, match.index! - 1000);
        const contextEnd = Math.min(html.length, match.index! + 2000);
        const context = html.substring(contextStart, contextEnd);

        // Extract author (look for multiple patterns)
        let author = 'Unknown Author';
        const authorPatterns = [
          /written\s+by:\s*([^<>\n]+?)(?:\s*<|$)/i,
          /by\s+([^<>\n]+?)(?:\s*<|$)/i,
          /author[^>]*>([^<]+)</i,
          /from\s+([^<>\n]+?)(?:\s*<|$)/i
        ];
        
        for (const pattern of authorPatterns) {
          const authorMatch = context.match(pattern);
          if (authorMatch && authorMatch[1].trim().length > 2 && !authorMatch[1].includes(':')) {
            author = authorMatch[1].trim();
            break;
          }
        }

        // Try to extract image from search results first (faster than product page)
        let imageUrl = null;
        
        // Look for images in the search results context
        const imgPatterns = [
          /<img[^>]+src=["']([^"'>]+)["'][^>]+alt=["'][^"'>]*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'>]*["']/i,
          /<img[^>]+alt=["'][^"'>]*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'>]*["'][^>]+src=["']([^"'>]+)["']/i,
          /<img[^>]+src=["']([^"'>]+)["'][^>]+class=["'][^"'>]*product-image[^"'>]*["']/i,
        ];

        for (const pattern of imgPatterns) {
          const imgMatch = context.match(pattern);
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
            break;
          }
        }

        // Only try product page if we didn't find an image in search results
        if (!imageUrl) {
          try {
            const productPage = await axios.get(`https://www.audible.ca${audibleUrl}`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
              },
              timeout: 10000,
              validateStatus: (status) => status < 500, // Accept 404 and other client errors
            });
            
            if (productPage.status === 200) {
              const productHtml = productPage.data;
              // Try og:image meta tag first
              const ogImgMatch = productHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
              if (ogImgMatch && ogImgMatch[1]) {
                imageUrl = ogImgMatch[1];
              } else {
                // Fallback: look for main product image
                const imgMatch = productHtml.match(/<img[^>]+src=["']([^"'>]+)["'][^>]+class=["'][^"'>]*productImage[^"'>]*["']/i);
                if (imgMatch && imgMatch[1]) {
                  imageUrl = imgMatch[1];
                }
              }
            } else {
              console.log(`Product page returned ${productPage.status} for ${audibleUrl}`);
            }
          } catch (e) {
            // Only log as error if it's not a 404
            if (e instanceof Error && e.message.includes('404')) {
              console.log(`Product page not found for ${audibleUrl}`);
            } else {
              console.error('Failed to fetch product page image:', e instanceof Error ? e.message : String(e));
            }
          }
        }

        // Extract duration (look for multiple patterns)
        let duration = 'Unknown duration';
        const durationPatterns = [
          /(\d+)\s*(?:hr|hour)s?\s*(\d+)\s*(?:min|minute)s?/i,
          /(\d+)\s*(?:hr|hour)s?/i,
          /(\d+)\s*(?:min|minute)s?/i,
          /runtime[^>]*>([^<]+)</i,
          /length[^>]*>([^<]+)</i
        ];
        
        for (const pattern of durationPatterns) {
          const durationMatch = context.match(pattern);
          if (durationMatch) {
            if (durationMatch[2]) {
              duration = `${durationMatch[1]}hr ${durationMatch[2]}min`;
            } else if (durationMatch[1]) {
              duration = durationMatch[0];
            }
            break;
          }
        }

        // Extract narrator (look for multiple patterns)
        let narrator = 'Unknown narrator';
        const narratorPatterns = [
          /narrated\s+by\s+([^<>\n]+?)(?:\s*<|$)/i,
          /narrator[^>]*>([^<]+)</i,
          /read\s+by\s+([^<>\n]+?)(?:\s*<|$)/i,
          /performed\s+by\s+([^<>\n]+?)(?:\s*<|$)/i
        ];
        
        for (const pattern of narratorPatterns) {
          const narratorMatch = context.match(pattern);
          if (narratorMatch && narratorMatch[1].trim().length > 2) {
            narrator = narratorMatch[1].trim();
            break;
          }
        }

        // Extract rating (look for multiple patterns)
        let rating = 0;
        const ratingPatterns = [
          /(\d+(?:\.\d+)?)\s*(?:stars?|★)/i,
          /rating[^>]*>([^<]+)</i,
          /(\d+(?:\.\d+)?)\s*out\s+of\s+5/i
        ];
        
        for (const pattern of ratingPatterns) {
          const ratingMatch = context.match(pattern);
          if (ratingMatch) {
            const ratingValue = parseFloat(ratingMatch[1]);
            if (ratingValue > 0 && ratingValue <= 5) {
              rating = ratingValue;
              break;
            }
          }
        }

        const fullAudibleUrl = `https://www.audible.ca${audibleUrl}`;
        const id = `audible_${Date.now()}_${i}`;

        books.push({
          id,
          type: 'audiobook',
          title: truncateText(title, 50),
          author: truncateText(author, 30),
          description: truncateText(`${title} by ${author}`, 100),
          thumbnail: ensureHttps(imageUrl) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop&crop=center',
          url: fullAudibleUrl,
          duration: duration,
          narrator: narrator,
          rating: rating,
          audibleUrl: fullAudibleUrl,
          source: 'audible',
          sourceUrl: fullAudibleUrl,
        });

      } catch (error) {
        console.error('Error processing audiobook:', error);
        continue;
      }
    }

    console.log(`🎧 Found ${books.length} audiobooks`);
    return books;
  } catch (error) {
    console.error('🎧 Audible search error:', error);
    return [];
  }
} 