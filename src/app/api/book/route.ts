import { NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

const fallbackData = {
  "kind": "books#volumes",
  "totalItems": 40,
  "items": [
    {
      "kind": "books#volume",
      "id": "FgAjFqUSQq0C",
      "etag": "kSjkXU0q424",
      "selfLink": "https://www.googleapis.com/books/v1/volumes/FgAjFqUSQq0C",
      "volumeInfo": {
        "title": "Library of Congress Subject Headings",
        "authors": [
          "Library of Congress"
        ],
        "publishedDate": "2007",
        "industryIdentifiers": [
          {
            "type": "OTHER",
            "identifier": "OSU:32435076471762"
          }
        ],
        "readingModes": {
          "text": false,
          "image": true
        },
        "pageCount": 1512,
        "printType": "BOOK",
        "categories": [
          "Subject headings, Library of Congress"
        ],
        "maturityRating": "NOT_MATURE",
        "allowAnonLogging": false,
        "contentVersion": "0.6.6.0.full.1",
        "panelizationSummary": {
          "containsEpubBubbles": false,
          "containsImageBubbles": false
        },
        "imageLinks": {
          "smallThumbnail": "http://books.google.com/books/content?id=FgAjFqUSQq0C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
          "thumbnail": "http://books.google.com/books/content?id=FgAjFqUSQq0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
        },
        "language": "en",
        "previewLink": "http://books.google.com/books?id=FgAjFqUSQq0C&pg=PA5852&dq=popular&hl=&cd=1&source=gbs_api",
        "infoLink": "https://play.google.com/store/books/details?id=FgAjFqUSQq0C&source=gbs_api",
        "canonicalVolumeLink": "https://play.google.com/store/books/details?id=FgAjFqUSQq0C"
      },
      "saleInfo": {
        "country": "US",
        "saleability": "FREE",
        "isEbook": true,
        "buyLink": "https://play.google.com/store/books/details?id=FgAjFqUSQq0C&rdid=book-FgAjFqUSQq0C&rdot=1&source=gbs_api"
      },
      "accessInfo": {
        "country": "US",
        "viewability": "ALL_PAGES",
        "embeddable": true,
        "publicDomain": true,
        "textToSpeechPermission": "ALLOWED",
        "epub": {
          "isAvailable": false,
          "downloadLink": "http://books.google.com/books/download/Library_of_Congress_Subject_Headings.epub?id=FgAjFqUSQq0C&hl=&output=epub&source=gbs_api"
        },
        "pdf": {
          "isAvailable": false
        },
        "webReaderLink": "http://play.google.com/books/reader?id=FgAjFqUSQq0C&hl=&source=gbs_api",
        "accessViewStatus": "FULL_PUBLIC_DOMAIN",
        "quoteSharingAllowed": false
      },
      "searchInfo": {
        "textSnippet": "Library of Congress. \u003cb\u003ePopular\u003c/b\u003e culture ( Continued ) Motherhood in \u003cb\u003epopular\u003c/b\u003e culture Mountain people in \u003cb\u003epopular\u003c/b\u003e culture Muslims in \u003cb\u003epopular\u003c/b\u003e culture Older people in \u003cb\u003epopular\u003c/b\u003e culture Organization in \u003cb\u003epopular\u003c/b\u003e culture Police in \u003cb\u003epopular\u003c/b\u003e culture&nbsp;..."
      }
    }
  ]
};

export const dynamic = 'force-dynamic';

// Helper function to convert HTTP URLs to HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = searchParams.get('maxResults') || '20';
    const startIndex = searchParams.get('startIndex') || '0';

    // Enhanced environment logging
    console.log('=== BOOKS SEARCH DEBUG INFO ===');
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasApiKey: !!process.env.GOOGLE_BOOKS_API_KEY,
      apiKeyLength: process.env.GOOGLE_BOOKS_API_KEY?.length,
      apiKeyPrefix: process.env.GOOGLE_BOOKS_API_KEY?.substring(0, 10) + '...',
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('GOOGLE'))
    });
    console.log('Request URL:', request.url);
    console.log('Search params:', { query, maxResults, startIndex });

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_BOOKS_API_KEY) {
      console.error('❌ Google Books API key is missing in production');
      console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('API')));
      return NextResponse.json(
        fallbackData,
        { status: 500 }
      );
    }

    // Log the actual request URL (without the API key)
    const requestUrl = `${GOOGLE_BOOKS_API_URL}?q=${query}&maxResults=${maxResults}&startIndex=${startIndex}&langRestrict=en&printType=books&orderBy=relevance`;
    console.log('Making request to:', requestUrl);
    console.log('API Key present:', !!process.env.GOOGLE_BOOKS_API_KEY);

    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults,
        startIndex,
        langRestrict: 'en',
        printType: 'books',
        orderBy: 'relevance',
        key: process.env.GOOGLE_BOOKS_API_KEY
      },
      timeout: 10000, // 10 second timeout
    });

    // Log response details
    console.log('✅ Google Books API response:', {
      status: response.status,
      statusText: response.statusText,
      itemsCount: response.data.items?.length || 0,
      totalItems: response.data.totalItems,
      hasError: !!response.data.error,
      errorMessage: response.data.error?.message
    });

    if (response.data.error) {
      console.error('❌ Google Books API returned an error:', response.data.error);
      return NextResponse.json(
        fallbackData,
        { status: 500 }
      );
    }

    // Convert all image URLs to HTTPS
    if (response.data.items) {
      response.data.items = response.data.items.map((item: any) => {
        if (item.volumeInfo?.imageLinks) {
          Object.keys(item.volumeInfo.imageLinks).forEach(key => {
            item.volumeInfo.imageLinks[key] = ensureHttps(item.volumeInfo.imageLinks[key]);
          });
        }
        return item;
      });
    }

    console.log('✅ Successfully processed and returning data');
    return NextResponse.json(response.data);
  } catch (error: any) {
    // Enhanced error logging
    console.error('❌ Books search error:', {
      message: error.message,
      code: error.code,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      },
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      }
    });

    if (error.response?.status === 403) {
      return NextResponse.json(
        fallbackData,
        { status: 429 }
      );
    }

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        fallbackData,
        { status: 408 }
      );
    }

    return NextResponse.json(
      fallbackData,
      { status: 500 }
    );
  }
}
