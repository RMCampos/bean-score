import { useEffect, useState } from 'react';

const TOKEN_KEY = 'bean_score_token';

const photoCache = new Map<string, { url: string; size: number }>();

export const usePhotoUrl = (placeId: string | null, type: 'photo' | 'thumbnail' = 'thumbnail') => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placeId) {
      setPhotoUrl(null);
      return;
    }

    const cacheKey = `${placeId}-${type}`;

    if (photoCache.has(cacheKey)) {
      setPhotoUrl(photoCache.get(cacheKey)!.url);
      return;
    }

    const fetchPhoto = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          setPhotoUrl(null);
          setLoading(false);
          return;
        }

        const endpoint = type === 'thumbnail'
          ? `/coffee-places/${placeId}/photo/thumbnail`
          : `/coffee-places/${placeId}/photo`;

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}${endpoint}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setPhotoUrl(null);
            setLoading(false);
            return;
          }
          console.error(`Failed to fetch photo: ${response.status}`);
          setPhotoUrl(null);
          setLoading(false);
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        photoCache.set(cacheKey, { url, size: blob.size });
        setPhotoUrl(url);
      } catch (err) {
        console.error('Error fetching photo:', err);
        setPhotoUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [placeId, type]);

  return { photoUrl, loading };
};

export const getPhotoCacheStats = () => {
  let totalSize = 0;
  let count = 0;

  photoCache.forEach((value) => {
    totalSize += value.size;
    count++;
  });

  return { totalSize, count };
};

export const clearPhotoCache = () => {
  photoCache.forEach((value) => {
    URL.revokeObjectURL(value.url);
  });
  photoCache.clear();
};

export const clearPlacePhotoCache = (placeId: string) => {
  const thumbnailKey = `${placeId}-thumbnail`;
  const photoKey = `${placeId}-photo`;

  if (photoCache.has(thumbnailKey)) {
    URL.revokeObjectURL(photoCache.get(thumbnailKey)!.url);
    photoCache.delete(thumbnailKey);
  }

  if (photoCache.has(photoKey)) {
    URL.revokeObjectURL(photoCache.get(photoKey)!.url);
    photoCache.delete(photoKey);
  }
};
