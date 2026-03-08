import { useEffect, useState } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import { useWatchedEpisodes } from '@/hooks/useWatchedEpisodes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { BarChart3, Clock, Film, Tv, Star, TrendingUp, Loader2 } from 'lucide-react';

const StatsPage = () => {
  const { user } = useAuth();
  const { library } = useLibrary();
  const [ratingData, setRatingData] = useState<{ rating: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const watched = library.filter(i => i.status === 'watched');
  const watching = library.filter(i => i.status === 'watching');
  const watchlist = library.filter(i => i.status === 'watchlist');

  const watchedMovies = watched.filter(i => i.mediaType === 'movie');
  const watchedTv = watched.filter(i => i.mediaType === 'tv');

  // Fetch ratings distribution
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('library')
        .select('user_rating')
        .eq('user_id', user.id)
        .not('user_rating', 'is', null);

      if (data) {
        const counts: Record<number, number> = {};
        (data as any[]).forEach(d => {
          const r = d.user_rating;
          counts[r] = (counts[r] || 0) + 1;
        });
        const dist = Array.from({ length: 10 }, (_, i) => ({
          rating: i + 1,
          count: counts[i + 1] || 0,
        }));
        setRatingData(dist);
      }
      setLoading(false);
    };
    load();
  }, [user, library]);

  const avgRating = (() => {
    const rated = ratingData.filter(d => d.count > 0);
    if (rated.length === 0) return 0;
    const total = ratingData.reduce((s, d) => s + d.rating * d.count, 0);
    const count = ratingData.reduce((s, d) => s + d.count, 0);
    return count > 0 ? total / count : 0;
  })();

  const totalRated = ratingData.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(...ratingData.map(d => d.count), 1);

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

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">Your Stats</h1>
          <p className="text-muted-foreground">Your viewing habits at a glance</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Film} label="Movies Watched" value={watchedMovies.length} />
          <StatCard icon={Tv} label="TV Shows Watched" value={watchedTv.length} />
          <StatCard icon={TrendingUp} label="Currently Watching" value={watching.length} />
          <StatCard icon={BarChart3} label="Watchlist" value={watchlist.length} />
        </div>

        {/* Rating Stats */}
        <div className="rounded-xl bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Your Ratings
            </h2>
            {avgRating > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{avgRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">avg from {totalRated} ratings</p>
              </div>
            )}
          </div>

          {totalRated === 0 ? (
            <p className="text-sm text-muted-foreground">Rate some movies or shows to see your distribution here.</p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {ratingData.map(d => (
                <div key={d.rating} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{d.count || ''}</span>
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all"
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
                  />
                  <span className="text-xs text-muted-foreground">{d.rating}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Genre Breakdown */}
        <GenreBreakdown />

        {/* Total in library */}
        <div className="rounded-xl bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Library Summary</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Total items in library: <span className="text-foreground font-medium">{library.length}</span></p>
            <p>Movies: <span className="text-foreground font-medium">{library.filter(i => i.mediaType === 'movie').length}</span></p>
            <p>TV Shows: <span className="text-foreground font-medium">{library.filter(i => i.mediaType === 'tv').length}</span></p>
          </div>
        </div>
      </main>
    </>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: typeof Film; label: string; value: number }) => (
  <div className="rounded-xl bg-card p-4 shadow-card text-center">
    <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const GenreBreakdown = () => {
  const { user } = useAuth();
  const [genres, setGenres] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('library')
        .select('genres')
        .eq('user_id', user.id)
        .eq('status', 'watched');

      if (data) {
        const counts: Record<string, number> = {};
        (data as any[]).forEach(d => {
          (d.genres || []).forEach((g: string) => {
            counts[g] = (counts[g] || 0) + 1;
          });
        });
        const sorted = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setGenres(sorted);
      }
    };
    load();
  }, [user]);

  if (genres.length === 0) return null;

  const max = genres[0]?.count || 1;

  return (
    <div className="rounded-xl bg-card p-6 shadow-card space-y-3">
      <h2 className="font-display text-xl font-semibold text-foreground">Top Genres</h2>
      <div className="space-y-2">
        {genres.map(g => (
          <div key={g.name} className="flex items-center gap-3">
            <span className="text-sm text-foreground w-24 shrink-0 truncate">{g.name}</span>
            <div className="flex-1 h-5 rounded bg-secondary overflow-hidden">
              <div
                className="h-full rounded bg-primary/80 transition-all"
                style={{ width: `${(g.count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-6 text-right">{g.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPage;
