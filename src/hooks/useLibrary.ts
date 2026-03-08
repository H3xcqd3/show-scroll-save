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
  genres?: string[];
  runtime?: number;
  userRating?: number | null;
  review?: string | null;
}

const STORAGE_KEY = 'cinetrack_library';

const loadFromStorage = (): LibraryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveToStorage = (items: LibraryItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useLibrary = () => {
  const [library, setLibrary] = useState<LibraryItem[]>(() => loadFromStorage());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveToStorage(library);
  }, [library]);

  const addToLibrary = useCallback((item: MediaItem, mediaType: MediaType, status: LibraryStatus) => {
    setLibrary(prev => {
      const filtered = prev.filter(l => !(l.id === item.id && l.mediaType === mediaType));
      const newItem: LibraryItem = {
        id: item.id,
        mediaType,
        title: item.title || item.name || 'Unknown',
        posterPath: item.poster_path,
        voteAverage: item.vote_average || 0,
        year: (item.release_date || item.first_air_date || '').slice(0, 4),
        status,
        addedAt: new Date().toISOString(),
        genres: (item as any).genres?.map((g: any) => g.name),
        runtime: (item as any).runtime,
      };
      return [newItem, ...filtered];
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

  const updateItem = useCallback((id: number, mediaType: MediaType, updates: Partial<LibraryItem>) => {
    setLibrary(prev => prev.map(l =>
      l.id === id && l.mediaType === mediaType ? { ...l, ...updates } : l
    ));
  }, []);

  return { library, loading, addToLibrary, removeFromLibrary, getStatus, getByStatus, updateItem };
};
