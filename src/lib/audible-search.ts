import axios from 'axios';

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Helper function to ensure HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, "https:");
}

// Export the search function so it can be called directly
export async function searchAudible(query: string, maxResults: number = 30) {
  if (!query) {
    return [];
  }

  const searchUrl = `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}`;
  console.log('🎧 Searching Audible with URL:', searchUrl);

  try {
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const scriptRegex = /<script type="application\/ld\+json">(.+?)<\/script>/g;
    let match;
    const books: any[] = [];
    
    while ((match = scriptRegex.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);
        
        if (jsonData['@type'] === 'ItemList' && jsonData.itemListElement) {
          for (const item of jsonData.itemListElement) {
            const book = item.item;
            if (book && book['@type'] === 'Audiobook') {
              
              const bookData = {
                id: `audible-${book.productID}`,
                type: 'audiobook',
                title: truncateText(book.name, 50),
                author: truncateText(book.author?.[0]?.name || 'Unknown Author', 30),
                description: truncateText(book.description || `Listen to ${book.name} on Audible.`, 100),
                thumbnail: ensureHttps(book.image) || 'https://via.placeholder.com/128x192.png?text=No+Image',
                url: book.url,
                duration: book.duration ? book.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm') : 'N/A',
                narrator: book.readBy?.[0]?.name || 'Unknown Narrator',
                rating: book.aggregateRating?.ratingValue || 0,
                audibleUrl: book.url,
                source: 'audible',
                sourceUrl: book.url,
              };
              books.push(bookData);
            }
          }
        }
      } catch (e) {
        console.warn('🎧 Could not parse a JSON-LD script tag:', e);
      }
    }

    if (books.length === 0) {
        console.warn('🎧 No audiobooks found using JSON-LD. The Audible website structure might have changed.');
        return [];
    }

    console.log(`🎧 Found ${books.length} audiobooks from Audible.`);
    return books.slice(0, maxResults);

  } catch (error) {
    console.error('🎧 Audible search failed:', error instanceof Error ? error.message : String(error));
    return [];
  }
}
