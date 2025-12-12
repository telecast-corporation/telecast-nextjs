'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
}

const ViewNewsPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const storedNews = localStorage.getItem('localNews');
      if (storedNews) {
        const news = JSON.parse(storedNews);
        const foundArticle = news.find((item: NewsArticle) => item.id === id);
        if (foundArticle) {
          setArticle(foundArticle);
        } else {
          setError('News article not found.');
        }
      } else {
        setError('No local news found in your browser\'s local storage.');
      }
    }
  }, [id]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.videoUrl && (
        <div className="mb-4">
          <video src={article.videoUrl} className="w-full h-auto" controls />
        </div>
      )}
      <p className="text-gray-700">{article.description}</p>
    </div>
  );
};

export default ViewNewsPage;
