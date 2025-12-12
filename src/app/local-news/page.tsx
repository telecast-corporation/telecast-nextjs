'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

const LocalNewsPage = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedNews = localStorage.getItem('localNews');
    if (storedNews) {
      setNews(JSON.parse(storedNews));
    }
  }, []);

  const handleNewsClick = (id: string) => {
    router.push(`/local-news/view?id=${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Local News</h1>
      {news.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {news.map((article) => (
            <div
              key={article.id}
              className="border rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleNewsClick(article.id)}
            >
              {article.videoUrl && (
                <video src={article.videoUrl} className="w-full h-auto" controls />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-gray-700">
                  {article.description && article.description.slice(0, 100)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No local news found in your browser's local storage.</p>
      )}
    </div>
  );
};

export default LocalNewsPage;
