'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
}

const LocalNewsPage = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/local-news');
        if (response.ok) {
          const data = await response.json();
          setNews(data.news);
        } else {
          console.error('Failed to fetch news');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  const handleNewsClick = (id: string) => {
    router.push(`/local-news/${id}`);
  };

  return (
    <div>
      <h1>Local News</h1>
      <ul>
        {news.map((article) => (
          <li key={article.id} onClick={() => handleNewsClick(article.id)}>
            {article.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LocalNewsPage;
