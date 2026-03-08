import { useState, useEffect, useCallback } from 'react';
import { MediaItem, MediaType } from '@/lib/tmdb';

export type LibraryStatus = 'watchlist' | 'watched' | 'watching';

export interface LibraryItem {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  year: string;
  status: LibraryStatus;
  addedAt: string;
}

const STORAGE_KEY = 'cinetrack_library';

const loadLibrary = (): LibraryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveLibrary = (items: LibraryItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useLibrary = () => {
  const [library, setLibrary] = useState<LibraryItem[]>(loadLibrary);

  useEffect(() => { saveLibrary(library); }, [library]);

  const addToLibrary = useCallback((item: MediaItem, mediaType: MediaType, status: LibraryStatus) => {
    setLibrary(prev => {
      const existing = prev.findIndex(l => l.id === item.id && l.mediaType === mediaType);
      const newItem: LibraryItem = {
        id: item.id,
        mediaType,
        title: item.title || item.name || 'Unknown',
        posterPath: item.poster_path,
        voteAverage: item.vote_average,
        year: (item.release_date || item.first_air_date || '').slice(0, 4),
        status,
        addedAt: new Date().toISOString(),
      };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newItem;
        return updated;
      }
      return [...prev, newItem];
    });
  }, []);

  const removeFromLibrary = useCallback((id: number, mediaType: MediaType) => {
    setLibrary(prev => prev.filter(l => !(l.id === id && l.mediaType === mediaType)));
  }, []);

  const getStatus = useCallback((id: number, mediaType: MediaType): LibraryStatus | null => {
    const item = library.find(l => l.id === id && l.mediaType === mediaType);
    return item?.status || null;
  }, [library]);

  const getByStatus = useCallback((status: LibraryStatus) => {
    return library.filter(l => l.status === status);
  }, [library]);

  return { library, addToLibrary, removeFromLibrary, getStatus, getByStatus };
};
