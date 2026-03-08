import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomLists, CustomListItem } from '@/hooks/useCustomLists';
import Navbar from '@/components/Navbar';
import MediaCard from '@/components/MediaCard';
import { MediaItem } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Lock, Copy, Loader2, ListPlus, Trash2 } from 'lucide-react';

const ListDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lists, updateList, getListItems, removeItem } = useCustomLists();
  const [items, setItems] = useState<CustomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const list = lists.find(l => l.id === id);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const data = await getListItems(id);
      setItems(data);
      setLoading(false);
    };
    load();
  }, [id, getListItems]);

  const handleRemove = async (tmdbId: number, mediaType: string) => {
    if (!id) return;
    await removeItem(id, tmdbId, mediaType);
    setItems(prev => prev.filter(i => !(i.tmdb_id === tmdbId && i.media_type === mediaType)));
    toast({ title: 'Removed from list' });
  };

  const shareUrl = list?.is_public ? `${window.location.origin}/shared-list/${id}` : null;

  const toMediaItem = (item: CustomListItem): MediaItem => ({
    id: item.tmdb_id,
    media_type: item.media_type as any,
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    title: item.media_type === 'movie' ? item.title : undefined,
    name: item.media_type === 'tv' ? item.title : undefined,
    release_date: item.media_type === 'movie' ? item.year || undefined : undefined,
    first_air_date: item.media_type === 'tv' ? item.year || undefined : undefined,
  } as MediaItem);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Link to="/lists" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Lists
        </Link>

        {list && (
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-bold text-foreground">{list.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={list.is_public}
                  onCheckedChange={(checked) => updateList(list.id, { is_public: checked })}
                />
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  {list.is_public ? <><Globe className="h-3.5 w-3.5" /> Public</> : <><Lock className="h-3.5 w-3.5" /> Private</>}
                </span>
              </div>

              {shareUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast({ title: 'Link copied!' });
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> Share Link
                </Button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ListPlus className="h-12 w-12 mb-4 opacity-50" />
            <p>This list is empty</p>
            <Link to="/search" className="mt-2 text-primary text-sm hover:underline">
              Search for something to add
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map(item => (
              <div key={`${item.tmdb_id}-${item.media_type}`} className="relative group">
                <MediaCard item={toMediaItem(item)} mediaType={item.media_type as any} />
                <button
                  onClick={() => handleRemove(item.tmdb_id, item.media_type)}
                  className="absolute top-2 right-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from list"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default ListDetailPage;
