
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface News {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
  user: {
    name: string;
    image: string;
  };
}

export default function LocalNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchParams.get('city')) {
        params.append('city', searchParams.get('city') as string);
      }
      if (searchParams.get('country')) {
        params.append('country', searchParams.get('country') as string);
      }

      try {
        const response = await fetch(`/api/local-news?${params.toString()}`);
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [searchParams]);

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (city) {
      params.set('city', city);
    }
    if (country) {
      params.set('country', country);
    }
    router.push(`/local-news?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Local News</h1>
        <button
          onClick={() => router.push('/local-news/upload')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Upload News
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm"
          />
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm"
          />
          <button
            onClick={handleFilterChange}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden shadow-lg">
              <video controls src={item.videoUrl} className="w-full h-48 object-cover"></video>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <div className="text-sm text-gray-500">
                  <span>{item.locationCity}, {item.locationCountry}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
