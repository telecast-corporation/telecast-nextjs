import React from 'react';
import Link from 'next/link';
import { TrendingItem } from '../types';

interface BookCardProps {
  book: TrendingItem;
  type: 'book' | 'audiobook';
}

const BookCard: React.FC<BookCardProps> = ({ book, type }) => {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const formatRatingsCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const detailUrl = type === 'audiobook' ? `/audiobooks/${book.id}` : `/book/${book.id}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-book.jpg';
          }}
        />
        {book.rating && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-semibold">
            ⭐ {formatRating(book.rating)}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {book.title}
        </h3>
        
        <p className="text-gray-600 mb-2">
          by {book.author}
        </p>
        
        {book.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-3">
            {book.description}
          </p>
        )}
        
        {/* Audiobook specific info */}
        {(book.duration || book.narrator) && (
          <div className="mb-3">
            {book.duration && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Duration:</span> {book.duration}
              </p>
            )}
            {book.narrator && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Narrator:</span> {book.narrator}
              </p>
            )}
          </div>
        )}
        
        {/* Rating info */}
        {book.rating && book.ratingsCount && (
          <div className="flex items-center mb-3">
            <span className="text-yellow-400 mr-1">⭐</span>
            <span className="text-sm text-gray-600">
              {formatRating(book.rating)} ({formatRatingsCount(book.ratingsCount)} ratings)
            </span>
          </div>
        )}
        
        {/* Categories */}
        {book.categories && book.categories.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {book.categories.slice(0, 3).map((category: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-col gap-2">
            <Link
              href={detailUrl}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 text-center py-2 px-4 rounded-md font-medium transition-colors duration-200"
            >
              View Details
            </Link>
          {type !== 'audiobook' && (
            <>
              {/* Listen on Audible */}
              {book.audibleUrl && (
                <a
                  href={book.audibleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-center py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>🎧</span>
                  Listen on Audible
                </a>
              )}
              
              {/* Read on Kindle */}
              {book.kindleUrl && (
                <a
                  href={book.kindleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>📖</span>
                  Read on Kindle
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;