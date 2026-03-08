import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLibrary } from '@/hooks/useLibrary';
import { getImageUrl, MediaItem } from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import MediaCard from '@/components/MediaCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Film, Tv, Star, Loader2, User, BarChart3 } from 'lucide-react';

interface PublicProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface PublicLibraryItem {
  tmdb_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  vote_average: number;
  year: string | null;
  status: string;
  user_rating: number | null;
}

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [library, setLibrary] = useState<PublicLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, bio')
        .eq('user_id', userId)
        .single();

      if (!profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileData as any);

      const { data: libData } = await supabase
        .from('library')
        .select('tmdb_id, media_type, title, poster_path, vote_average, year, status, user_rating')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      setLibrary((libData as any[]) || []);
      setLoading(false);
    };
    load();
  }, [userId]);

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

  if (notFound || !profile) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <p>Profile not found</p>
        </div>
      </>
    );
  }

  const watched = library.filter(i => i.status === 'watched');
  const watchlist = library.filter(i => i.status === 'watchlist');
  const rated = library.filter(i => i.user_rating != null);
  const avgRating = rated.length > 0
    ? (rated.reduce((s, i) => s + (i.user_rating || 0), 0) / rated.length).toFixed(1)
    : null;

  const toMediaItem = (item: PublicLibraryItem): MediaItem => ({
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
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Profile Header */}
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-xl text-primary">
              {profile.display_name?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{profile.display_name || 'User'}</h1>
            {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{watched.length}</p>
            <p className="text-xs text-muted-foreground">Watched</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{watchlist.length}</p>
            <p className="text-xs text-muted-foreground">Watchlist</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-primary">{avgRating || '—'}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </div>

        {/* Watched Section */}
        {watched.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">✅ Watched</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {watched.slice(0, 20).map(item => (
                <MediaCard key={`${item.tmdb_id}-${item.media_type}`} item={toMediaItem(item)} mediaType={item.media_type as any} />
              ))}
            </div>
          </div>
        )}

        {/* Watchlist Section */}
        {watchlist.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">📋 Watchlist</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {watchlist.slice(0, 20).map(item => (
                <MediaCard key={`${item.tmdb_id}-${item.media_type}`} item={toMediaItem(item)} mediaType={item.media_type as any} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default PublicProfilePage;
