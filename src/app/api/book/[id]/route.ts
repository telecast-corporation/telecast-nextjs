import { NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: bookId } = params;

  if (!bookId) {
    return NextResponse.json(
      { error: 'Book ID is required' },
      { status: 400 }
    );
  }

  if (!GOOGLE_BOOKS_API_KEY) {
    return NextResponse.json(
      { error: 'Google Books API key is not configured' },
      { status: 500 }
    );
  }

  try {
    // Helper to ensure HTTPS
    function ensureHttps(url: string | undefined): string | undefined {
      if (!url) return url;
      return url.replace(/^http:/, 'https:');
    }

    // Fetch book details from Google Books API
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`
    );

    const bookData = response.data;

    // Fetch related books based on the title
    const relatedResponse = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookData.volumeInfo.title)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`
    );

    const relatedBooks = relatedResponse.data.items
      ?.filter((item: any) => item.id !== bookId)
      .map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Unknown Author',
        thumbnail: ensureHttps(item.volumeInfo.imageLinks?.thumbnail) || '/placeholder-book.png',
        description: item.volumeInfo.description || 'No description available',
      })) || [];

    // Format the response
    const previewLink = bookData.volumeInfo.previewLink
      ? bookData.volumeInfo.previewLink + '&printsec=frontcover#v=onepage&q&f=false'
      : null;
    const formattedResponse = {
      id: bookData.id,
      title: bookData.volumeInfo.title,
      author: {
        name: bookData.volumeInfo.authors?.[0] || 'Unknown Author',
        image: ensureHttps(bookData.volumeInfo.imageLinks?.thumbnail) || '/placeholder-author.png',
      },
      details: {
        publisher: bookData.volumeInfo.publisher || 'Unknown Publisher',
        publishedDate: bookData.volumeInfo.publishedDate || 'Unknown Date',
        pageCount: bookData.volumeInfo.pageCount || 'Unknown',
        language: bookData.volumeInfo.language || 'Unknown',
        isbn: bookData.volumeInfo.industryIdentifiers?.[0]?.identifier || 'Unknown',
      },
      description: bookData.volumeInfo.description || 'No description available',
      cover: ensureHttps(bookData.volumeInfo.imageLinks?.thumbnail) || '/placeholder-book.png',
      categories: bookData.volumeInfo.categories || [],
      rating: bookData.volumeInfo.averageRating || 0,
      ratingCount: bookData.volumeInfo.ratingsCount || 0,
      previewLink,
      relatedBooks,
    };

    return NextResponse.json(formattedResponse);
  } catch (error: any) {
    console.error('Error fetching book details:', error);
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
} 