import { useState, useEffect, useCallback } from 'react';
import { MediaItem, MediaType } from '@/lib/tmdb';

export interface CustomList {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
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

const LISTS_KEY = 'cinetrack_lists';
const LIST_ITEMS_KEY = 'cinetrack_list_items';

const loadLists = (): CustomList[] => {
  try { return JSON.parse(localStorage.getItem(LISTS_KEY) || '[]'); } catch { return []; }
};
const saveLists = (lists: CustomList[]) => localStorage.setItem(LISTS_KEY, JSON.stringify(lists));

const loadItems = (): CustomListItem[] => {
  try { return JSON.parse(localStorage.getItem(LIST_ITEMS_KEY) || '[]'); } catch { return []; }
};
const saveItems = (items: CustomListItem[]) => localStorage.setItem(LIST_ITEMS_KEY, JSON.stringify(items));

const genId = () => crypto.randomUUID();

export const useCustomLists = () => {
  const [lists, setLists] = useState<CustomList[]>(() => loadLists());
  const [allItems, setAllItems] = useState<CustomListItem[]>(() => loadItems());
  const [loading] = useState(false);

  useEffect(() => { saveLists(lists); }, [lists]);
  useEffect(() => { saveItems(allItems); }, [allItems]);

  const createList = useCallback((name: string, description = '', isPublic = false) => {
    const now = new Date().toISOString();
    const newList: CustomList = {
      id: genId(), name, description, is_public: isPublic,
      created_at: now, updated_at: now,
    };
    setLists(prev => [newList, ...prev]);
    return newList;
  }, []);

  const deleteList = useCallback((listId: string) => {
    setLists(prev => prev.filter(l => l.id !== listId));
    setAllItems(prev => prev.filter(i => i.list_id !== listId));
  }, []);

  const updateList = useCallback((listId: string, updates: Partial<Pick<CustomList, 'name' | 'description' | 'is_public'>>) => {
    setLists(prev => prev.map(l => l.id === listId ? { ...l, ...updates, updated_at: new Date().toISOString() } : l));
  }, []);

  const addItem = useCallback(async (listId: string, item: MediaItem, mediaType: MediaType) => {
    const newItem: CustomListItem = {
      id: genId(),
      list_id: listId,
      tmdb_id: item.id,
      media_type: mediaType,
      title: item.title || item.name || 'Unknown',
      poster_path: item.poster_path,
      vote_average: item.vote_average || 0,
      year: (item.release_date || item.first_air_date || '').slice(0, 4),
      added_at: new Date().toISOString(),
    };
    setAllItems(prev => [newItem, ...prev]);
  }, []);

  const removeItem = useCallback(async (listId: string, tmdbId: number, mediaType: string) => {
    setAllItems(prev => prev.filter(i => !(i.list_id === listId && i.tmdb_id === tmdbId && i.media_type === mediaType)));
  }, []);

  const getListItems = useCallback(async (listId: string): Promise<CustomListItem[]> => {
    return allItems.filter(i => i.list_id === listId).sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
  }, [allItems]);

  const fetchLists = useCallback(() => {}, []);

  return { lists, loading, createList, deleteList, updateList, addItem, removeItem, getListItems, fetchLists };
};
