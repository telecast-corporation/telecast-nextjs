
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const fallbackData = {
    "kind": "books#volumes",
    "totalItems": 1000000,
    "items": [
      {
        "kind": "books#volume",
        "id": "YwkSt9xAlbYC",
        "etag": "1q29k4QmVjM",
        "selfLink": "https://www.googleapis.com/books/v1/volumes/YwkSt9xAlbYC",
        "volumeInfo": {
          "title": "Numeric list of lenders",
          "publishedDate": "19??",
          "industryIdentifiers": [
            {
              "type": "OTHER",
              "identifier": "COLUMBIA:CU14495155"
            }
          ],
          "readingModes": {
            "text": false,
            "image": true
          },
          "pageCount": 812,
          "printType": "BOOK",
          "maturityRating": "NOT_MATURE",
          "allowAnonLogging": false,
          "contentVersion": "0.6.7.0.full.1",
          "panelizationSummary": {
            "containsEpubBubbles": false,
            "containsImageBubbles": false
          },
          "imageLinks": {
            "smallThumbnail": "http://books.google.com/books/content?id=YwkSt9xAlbYC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
            "thumbnail": "http://books.google.com/books/content?id=YwkSt9xAlbYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
          },
          "language": "en",
          "previewLink": "http://books.google.ca/books?id=YwkSt9xAlbYC&pg=PA392&dq=popular&hl=&as_pt=BOOKS&cd=1&source=gbs_api",
          "infoLink": "https://play.google.com/store/books/details?id=YwkSt9xAlbYC&source=gbs_api",
          "canonicalVolumeLink": "https://play.google.com/store/books/details?id=YwkSt9xAlbYC"
        },
        "saleInfo": {
          "country": "CA",
          "saleability": "FREE",
          "isEbook": true,
          "buyLink": "https://play.google.com/store/books/details?id=YwkSt9xAlbYC&rdid=book-YwkSt9xAlbYC&rdot=1&source=gbs_api"
        },
        "accessInfo": {
          "country": "CA",
          "viewability": "ALL_PAGES",
          "embeddable": true,
          "publicDomain": true,
          "textToSpeechPermission": "ALLOWED",
          "epub": {
            "isAvailable": false,
            "downloadLink": "http://books.google.ca/books/download/Numeric_list_of_lenders.epub?id=YwkSt9xAlbYC&hl=&output=epub&source=gbs_api"
          },
          "pdf": {
            "isAvailable": false
          },
          "webReaderLink": "http://play.google.com/books/reader?id=YwkSt9xAlbYC&hl=&as_pt=BOOKS&source=gbs_api",
          "accessViewStatus": "FULL_PUBLIC_DOMAIN",
          "quoteSharingAllowed": false
        },
        "searchInfo": {
          "textSnippet": "... <b>POPULAR</b> DE PUERTO RICO 812423 BANCO <b>POPULAR</b> DE PUERTO RICO 812425 BANCO <b>POPULAR</b> DE PUERTO RICO 812426 BANCO <b>POPULAR</b> DE PUERTO RICO 812427 BANCO <b>POPULAR</b> DE PUERTO RICO 812428 BANCO <b>POPULAR</b> DE PUERTO RICO 812429 BANCO <b>POPULAR</b> DE PUERTO&nbsp;..."
        }
      },
      {
        "kind": "books#volume",
        "id": "FgAjFqUSQq0C",
        "etag": "UN9mOFa1yjs",
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
          "previewLink": "http://books.google.ca/books?id=FgAjFqUSQq0C&pg=PA5852&dq=popular&hl=&as_pt=BOOKS&cd=2&source=gbs_api",
          "infoLink": "https://play.google.com/store/books/details?id=FgAjFqUSQq0C&source=gbs_api",
          "canonicalVolumeLink": "https://play.google.com/store/books/details?id=FgAjFqUSQq0C"
        },
        "saleInfo": {
          "country": "CA",
          "saleability": "FREE",
          "isEbook": true,
          "buyLink": "https://play.google.com/store/books/details?id=FgAjFqUSQq0C&rdid=book-FgAjFqUSQq0C&rdot=1&source=gbs_api"
        },
        "accessInfo": {
          "country": "CA",
          "viewability": "ALL_PAGES",
          "embeddable": true,
          "publicDomain": true,
          "textToSpeechPermission": "ALLOWED",
          "epub": {
            "isAvailable": false,
            "downloadLink": "http://books.google.ca/books/download/Library_of_Congress_Subject_Headings.epub?id=FgAjFqUSQq0C&hl=&output=epub&source=gbs_api"
          },
          "pdf": {
            "isAvailable": false
          },
          "webReaderLink": "http://play.google.com/books/reader?id=FgAjFqUSQq0C&hl=&as_pt=BOOKS&source=gbs_api",
          "accessViewStatus": "FULL_PUBLIC_DOMAIN",
          "quoteSharingAllowed": false
        },
        "searchInfo": {
          "textSnippet": "Library of Congress. <b>Popular</b> culture ( Continued ) Motherhood in <b>popular</b> culture Mountain people in <b>popular</b> culture Muslims in <b>popular</b> culture Older people in <b>popular</b> culture Organization in <b>popular</b> culture Police in <b>popular</b> culture&nbsp;..."
        }
      }
    ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    const books = google.books({
      version: 'v1',
      auth: process.env.GOOGLE_BOOKS_API_KEY,
    });

    const res = await books.volumes.list({
      q: query,
      maxResults: 20,
      langRestrict: 'en',
      printType: 'books',
      orderBy: 'relevance',
    });

    return NextResponse.json(res.data);
  } catch (error) {
    console.error('Google Books API error:', error);
    return NextResponse.json(fallbackData, { status: 500, statusText: "API Failure" });
  }
}
