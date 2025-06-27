import { NextResponse } from 'next/server';
import { searchAudible } from '@/lib/audible-search';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'fiction';
    
    console.log('🔍 Debug: Testing audiobook search for query:', query);
    
    // Test the searchAudible function directly
    const books = await searchAudible(query, 5);
    
    console.log('🔍 Debug: Raw audiobooks from searchAudible:', books.map(book => ({
      title: book.title,
      url: book.url,
      audibleUrl: book.audibleUrl,
      id: book.id,
      type: book.type
    })));
    
    // Test the mapping that happens in searchAudiobooks
    const mappedBooks = books.map((item: any) => ({
      type: 'audiobook',
      id: item.id,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      url: item.url,
      author: item.author,
      duration: item.duration,
      narrator: item.narrator,
      rating: item.rating,
      audibleUrl: item.audibleUrl,
      source: 'audible',
      sourceUrl: item.sourceUrl,
    }));
    
    console.log('🔍 Debug: Mapped audiobooks:', mappedBooks.map(book => ({
      title: book.title,
      url: book.url,
      audibleUrl: book.audibleUrl,
      id: book.id,
      type: book.type
    })));
    
    return NextResponse.json({
      query,
      rawBooks: books,
      mappedBooks: mappedBooks,
      testUrls: mappedBooks.map(book => {
        const audibleUrl = book.audibleUrl || book.url || `https://www.audible.ca/search?keywords=${encodeURIComponent(book.title)}`;
        return {
          title: book.title,
          originalAudibleUrl: book.audibleUrl,
          originalUrl: book.url,
          finalUrl: audibleUrl,
          isExternal: audibleUrl.startsWith('http')
        };
      })
    });
  } catch (error) {
    console.error('🔍 Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 