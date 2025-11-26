
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CityCountryInput from '../../components/CityCountryInput';

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
      const cityParam = searchParams.get('city');
      const countryParam = searchParams.get('country');

      if (cityParam) {
        params.append('city', cityParam);
        setCity(cityParam);
      }
      if (countryParam) {
        params.append('country', countryParam);
        setCountry(countryParam);
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
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-4xl font-bold text-gray-800">Local News</h1>
        <button
          onClick={() => router.push('/local-news/upload')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
          Upload News
        </button>
      </header>

      {/* Filter Section */}
      <div className="mb-10 p-6 border rounded-xl bg-white/60 backdrop-blur-md shadow-sm fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2">
            <CityCountryInput
              onCityChange={setCity}
              onCountryChange={setCountry}
              initialCity={city}
              initialCountry={country}
            />
          </div>
          <button
            onClick={handleFilterChange}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-all w-full h-12"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Loading news...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-md transition-all transform hover:-translate-y-2 hover:shadow-xl stagger-fade-in"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <video controls src={item.videoUrl} className="w-full h-56 object-cover"></video>
              <div className="p-5">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-700 mb-4">{item.description}</p>
                <div className="text-sm text-gray-500 font-medium">
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
