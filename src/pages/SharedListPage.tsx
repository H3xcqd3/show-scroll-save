import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import MediaCard from '@/components/MediaCard';
import { Loader2, ListPlus } from 'lucide-react';

const SharedListPage = () => {
  const { id } = useParams<{ id: string }>();
  const [listName, setListName] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: listData } = await supabase
        .from('custom_lists')
        .select('name, is_public')
        .eq('id', id)
        .single();

      if (!listData || !(listData as any).is_public) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setListName((listData as any).name);

      const { data: itemsData } = await supabase
        .from('custom_list_items')
        .select('*')
        .eq('list_id', id)
        .order('added_at', { ascending: false });

      setItems((itemsData as any[]) || []);
      setLoading(false);
    };
    load();
  }, [id]);

  const toMediaItem = (item: any): MediaItem => ({
    id: item.tmdb_id,
    media_type: item.media_type,
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    title: item.media_type === 'movie' ? item.title : undefined,
    name: item.media_type === 'tv' ? item.title : undefined,
  } as MediaItem);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <p>List not found or is private</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <h1 className="font-display text-3xl font-bold text-foreground">{listName}</h1>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ListPlus className="h-12 w-12 mb-4 opacity-50" />
            <p>This list is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map(item => (
              <MediaCard key={`${item.tmdb_id}-${item.media_type}`} item={toMediaItem(item)} mediaType={item.media_type} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default SharedListPage;
