import { useState, useEffect, useCallback } from 'react';
import { MediaItem, MediaType } from '@/lib/tmdb';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export const useLibrary = () => {
  const { user } = useAuth();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = useCallback(async () => {
    if (!user) { setLibrary([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('library')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });
    if (!error && data) {
      setLibrary(data.map(row => ({
        id: row.tmdb_id,
        mediaType: row.media_type as MediaType,
        title: row.title,
        posterPath: row.poster_path,
        voteAverage: Number(row.vote_average) || 0,
        year: row.year || '',
        status: row.status as LibraryStatus,
        addedAt: row.added_at,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLibrary(); }, [fetchLibrary]);

  const addToLibrary = useCallback(async (item: MediaItem, mediaType: MediaType, status: LibraryStatus) => {
    if (!user) return;
    const row: Record<string, any> = {
      user_id: user.id,
      tmdb_id: item.id,
      media_type: mediaType,
      title: item.title || item.name || 'Unknown',
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      year: (item.release_date || item.first_air_date || '').slice(0, 4),
      status,
    };
    // Store genres and runtime if available (from detail pages)
    if ((item as any).genres) {
      row.genres = (item as any).genres.map((g: any) => g.name);
    }
    if ((item as any).runtime) {
      row.runtime = (item as any).runtime;
    }
    await supabase.from('library').upsert(row, { onConflict: 'user_id,tmdb_id,media_type' });
    fetchLibrary();
  }, [user, fetchLibrary]);

  const removeFromLibrary = useCallback(async (id: number, mediaType: MediaType) => {
    if (!user) return;
    await supabase.from('library').delete().eq('user_id', user.id).eq('tmdb_id', id).eq('media_type', mediaType);
    fetchLibrary();
  }, [user, fetchLibrary]);

  const getStatus = useCallback((id: number, mediaType: MediaType): LibraryStatus | null => {
    const item = library.find(l => l.id === id && l.mediaType === mediaType);
    return item?.status || null;
  }, [library]);

  const getByStatus = useCallback((status: LibraryStatus) => {
    return library.filter(l => l.status === status);
  }, [library]);

  return { library, loading, addToLibrary, removeFromLibrary, getStatus, getByStatus };
};
