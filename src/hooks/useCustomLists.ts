import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MediaItem, MediaType } from '@/lib/tmdb';

export interface CustomList {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface CustomListItem {
  id: string;
  list_id: string;
  tmdb_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  vote_average: number;
  year: string | null;
  added_at: string;
}

export const useCustomLists = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    if (!user) { setLists([]); setLoading(false); return; }
    const { data } = await supabase
      .from('custom_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setLists(data as any[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const createList = useCallback(async (name: string, description = '', isPublic = false) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('custom_lists')
      .insert({ user_id: user.id, name, description, is_public: isPublic } as any)
      .select()
      .single();
    if (!error) fetchLists();
    return data as any as CustomList | null;
  }, [user, fetchLists]);

  const deleteList = useCallback(async (listId: string) => {
    await supabase.from('custom_lists').delete().eq('id', listId);
    fetchLists();
  }, [fetchLists]);

  const updateList = useCallback(async (listId: string, updates: Partial<Pick<CustomList, 'name' | 'description' | 'is_public'>>) => {
    await supabase.from('custom_lists').update(updates as any).eq('id', listId);
    fetchLists();
  }, [fetchLists]);

  const addItem = useCallback(async (listId: string, item: MediaItem, mediaType: MediaType) => {
    await supabase.from('custom_list_items').insert({
      list_id: listId,
      tmdb_id: item.id,
      media_type: mediaType,
      title: item.title || item.name || 'Unknown',
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      year: (item.release_date || item.first_air_date || '').slice(0, 4),
    } as any);
  }, []);

  const removeItem = useCallback(async (listId: string, tmdbId: number, mediaType: string) => {
    await supabase.from('custom_list_items').delete()
      .eq('list_id', listId)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType);
  }, []);

  const getListItems = useCallback(async (listId: string): Promise<CustomListItem[]> => {
    const { data } = await supabase
      .from('custom_list_items')
      .select('*')
      .eq('list_id', listId)
      .order('added_at', { ascending: false });
    return (data as any[]) || [];
  }, []);

  return { lists, loading, createList, deleteList, updateList, addItem, removeItem, getListItems, fetchLists };
};
