
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface News {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminLocalNewsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/admin/local-news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchNews();
    }
  }, [user, authLoading]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/local-news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setNews(news.map(item => item.id === id ? { ...item, status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  if (authLoading || loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!user || !user.isAdmin) {
    return <p>You are not authorized to view this page.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Moderate Local News</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Submission
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Author
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-bold">
                    {item.title}
                  </p>
                  <p className="text-gray-600 whitespace-no-wrap">{item.description}</p>
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Watch Video
                  </a>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{item.user.name}</p>
                  <p className="text-gray-600 whitespace-no-wrap">{item.user.email}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${item.status === 'approved' ? 'text-green-900' : item.status === 'rejected' ? 'text-red-900' : 'text-yellow-900'}`}>
                    <span aria-hidden className={`absolute inset-0 ${item.status === 'approved' ? 'bg-green-200' : item.status === 'rejected' ? 'bg-red-200' : 'bg-yellow-200'} opacity-50 rounded-full`}></span>
                    <span className="relative">{item.status}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'approved')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mr-2">
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
