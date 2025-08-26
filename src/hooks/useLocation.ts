import { useState, useEffect } from 'react';

interface Location {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if geolocation is supported
        if (!navigator.geolocation) {
          console.log('Geolocation not supported, using Toronto as fallback');
          setLocation({ city: 'Toronto', country: 'Canada' });
          setLoading(false);
          return;
        }

        // Try to get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        });

        const { latitude, longitude } = position.coords;

        // Use a reverse geocoding service to get city name
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            setLocation({
              city: data.city || data.locality || 'Toronto',
              country: data.countryName || 'Canada',
              latitude,
              longitude,
            });
          } else {
            throw new Error('Failed to get location name');
          }
        } catch (geocodingError) {
          console.log('Geocoding failed, using coordinates as location');
          setLocation({
            city: 'Toronto',
            country: 'Canada',
            latitude,
            longitude,
          });
        }
      } catch (locationError) {
        console.log('Location access denied or failed, using Toronto as fallback');
        setError('Location access denied');
        setLocation({ city: 'Toronto', country: 'Canada' });
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  return { location, loading, error };
}
