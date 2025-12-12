'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
}

const ViewNewsPage = () => {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/local-news?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            setArticle(data.news);
          } else {
            console.error('Failed to fetch article');
          }
        } catch (error) {
          console.error('Error fetching article:', error);
        }
      }
    };

    fetchArticle();
  }, [id]);

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  );
};

export default ViewNewsPage;
