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
    console.log('🔍 Environment:', process.env.NODE_ENV);
    console.log('🔍 Max results:', maxResults);

    // Use a more consistent search URL with fewer parameters
    const searchUrl = `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}&ref=a_search_c1_header_0_1_1_1&pf_rd_p=1d79b443-2f1d-43a3-b1dc-31a2cd242566&pf_rd_r=1&pf_rd_s=center-1&pf_rd_t=101&pf_rd_i=audible-search&pf_rd_m=A2ZO8JX97D5MN9&pf_rd_q=1`;

    console.log('🔍 Search URL:', searchUrl);

    // Enhanced headers for better consistency across environments
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-CA,en;q=0.9,en-US;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'DNT': '1',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
    };

    console.log('🔍 Using headers:', Object.keys(headers));

    // Fetch the search page with enhanced headers
    const response = await axios.get(searchUrl, {
      headers,
      timeout: 30000, // Increased timeout
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept 404 and other client errors
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', {
      'content-type': response.headers['content-type'],
      'content-length': response.headers['content-length'],
      'server': response.headers['server'],
    });

    const html = response.data;
    console.log('🔍 HTML length:', html.length);
    console.log('🔍 HTML preview (first 500 chars):', html.substring(0, 500));

    const books: any[] = [];

    console.log('🔍 Parsing Audible search results...');

    // Enhanced regex patterns with better debugging
    const audiobookLinkPatterns = [
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*class="[^"]*bc-link[^"]*"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*data-bc-link[^>]*>([^<]+)<\/a>/gi,
      /href="(\/pd\/[^"]*)"[^>]*>([^<]+)</gi, // Fallback pattern
    ];

    let matches: RegExpMatchArray[] = [];
    let usedPattern = 0;

    for (let i = 0; i < audiobookLinkPatterns.length; i++) {
      const pattern = audiobookLinkPatterns[i];
      const patternMatches = [...html.matchAll(pattern)];
      console.log(`🔍 Pattern ${i + 1} found ${patternMatches.length} matches`);
      
      if (patternMatches.length > 0) {
        matches = patternMatches;
        usedPattern = i + 1;
        console.log(`🔍 Using pattern ${usedPattern} with ${matches.length} audiobooks`);
        break;
      }
    }

    if (matches.length === 0) {
      console.log('🔍 No audiobooks found with any pattern');
      return [];
    }

    console.log(`🔍 Processing ${Math.min(matches.length, maxResults)} audiobooks`);

    // Log first few matches for debugging
    const sampleMatches = matches.slice(0, 3);
    console.log('🔍 Sample matches:');
    sampleMatches.forEach((match, index) => {
      console.log(`  ${index + 1}. URL: ${match[1]}, Title: ${match[2].trim()}`);
    });

    for (let i = 0; i < Math.min(matches.length, maxResults); i++) {
      try {
        const match = matches[i];
        const audibleUrl = match[1];
        const title = match[2].trim();

        console.log(`🔍 Processing audiobook ${i + 1}: ${title} (${audibleUrl})`);

        if (!title || title.length < 3) {
          console.log(`🔍 Skipping audiobook ${i + 1}: title too short`);
          continue;
        }

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

        console.log(`🔍 Author for "${title}": ${author}`);

        // Try to extract image from search results first (faster than product page)
        let imageUrl = null;
        
        // Look for images in the search results context
        const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const imgPatterns = [
          new RegExp(`<img[^>]+src=["']([^"'>]+)["'][^>]+alt=["'][^"'>]*${escapedTitle}[^"'>]*["']`, 'i'),
          new RegExp(`<img[^>]+alt=["'][^"'>]*${escapedTitle}[^"'>]*["'][^>]+src=["']([^"'>]+)["']`, 'i'),
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
          console.log(`🔍 No image found in search results for "${title}", trying product page`);
          try {
            const productUrl = `https://www.audible.ca${audibleUrl}`;
            console.log(`🔍 Fetching product page: ${productUrl}`);
            
            const productPage = await axios.get(productUrl, {
              headers,
              timeout: 15000,
              validateStatus: (status) => status < 500, // Accept 404 and other client errors
            });
            
            if (productPage.status === 200) {
              const productHtml = productPage.data;
              // Try og:image meta tag first
              const ogImgMatch = productHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
              if (ogImgMatch && ogImgMatch[1]) {
                imageUrl = ogImgMatch[1];
                console.log(`🔍 Found og:image for "${title}": ${imageUrl}`);
              } else {
                // Fallback: look for main product image
                const imgMatch = productHtml.match(/<img[^>]+src=["']([^"'>]+)["'][^>]+class=["'][^"'>]*productImage[^"'>]*["']/i);
                if (imgMatch && imgMatch[1]) {
                  imageUrl = imgMatch[1];
                  console.log(`🔍 Found product image for "${title}": ${imageUrl}`);
                }
              }
            } else {
              console.log(`🔍 Product page returned ${productPage.status} for ${audibleUrl}`);
            }
          } catch (e) {
            // Only log as error if it's not a 404
            if (e instanceof Error && e.message.includes('404')) {
              console.log(`🔍 Product page not found for ${audibleUrl}`);
            } else {
              console.error(`🔍 Failed to fetch product page image for "${title}":`, e instanceof Error ? e.message : String(e));
            }
          }
        } else {
          console.log(`🔍 Found image in search results for "${title}": ${imageUrl}`);
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

        // Clean up the URL to remove tracking parameters that might cause issues
        const cleanUrl = fullAudibleUrl.split('?')[0]; // Remove all query parameters

        const bookData = {
          id,
          type: 'audiobook',
          title: truncateText(title, 50),
          author: truncateText(author, 30),
          description: truncateText(`${title} by ${author}`, 100),
          thumbnail: ensureHttps(imageUrl) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop&crop=center',
          url: cleanUrl,
          duration: duration,
          narrator: narrator,
          rating: rating,
          audibleUrl: cleanUrl,
          source: 'audible',
          sourceUrl: cleanUrl,
        };

        console.log(`🔍 Final book data for "${title}":`, {
          id: bookData.id,
          title: bookData.title,
          author: bookData.author,
          url: bookData.url,
          duration: bookData.duration,
          narrator: bookData.narrator,
          rating: bookData.rating,
        });

        books.push(bookData);

      } catch (error) {
        console.error(`🔍 Error processing audiobook ${i + 1}:`, error);
        continue;
      }
    }

    console.log(`🎧 Found ${books.length} audiobooks total`);
    console.log('🎧 Final book URLs:');
    books.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title} -> ${book.url}`);
    });
    
    return books;
  } catch (error) {
    console.error('🎧 Audible search error:', error);
    if (error instanceof Error) {
      console.error('🎧 Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return [];
  }
} 