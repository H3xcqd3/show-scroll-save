import { useLibrary } from '@/hooks/useLibrary';
import Navbar from '@/components/Navbar';
import { BarChart3, Film, Tv, Star, TrendingUp } from 'lucide-react';

const StatsPage = () => {
  const { library } = useLibrary();

  const watched = library.filter(i => i.status === 'watched');
  const watching = library.filter(i => i.status === 'watching');
  const watchlist = library.filter(i => i.status === 'watchlist');

  const watchedMovies = watched.filter(i => i.mediaType === 'movie');
  const watchedTv = watched.filter(i => i.mediaType === 'tv');

  // Rating distribution from localStorage data
  const ratingData = Array.from({ length: 10 }, (_, i) => {
    const rating = i + 1;
    const count = library.filter(l => l.userRating === rating).length;
    return { rating, count };
  });

  const totalRated = ratingData.reduce((s, d) => s + d.count, 0);
  const avgRating = totalRated > 0
    ? ratingData.reduce((s, d) => s + d.rating * d.count, 0) / totalRated
    : 0;
  const maxCount = Math.max(...ratingData.map(d => d.count), 1);

  // Genre breakdown
  const genreCounts: Record<string, number> = {};
  watched.forEach(item => {
    (item.genres || []).forEach(g => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });
  const genres = Object.entries(genreCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const maxGenre = genres[0]?.count || 1;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">Your Stats</h1>
          <p className="text-muted-foreground">Your viewing habits at a glance</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Film} label="Movies Watched" value={watchedMovies.length} />
          <StatCard icon={Tv} label="TV Shows Watched" value={watchedTv.length} />
          <StatCard icon={TrendingUp} label="Currently Watching" value={watching.length} />
          <StatCard icon={BarChart3} label="Watchlist" value={watchlist.length} />
        </div>

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

        {genres.length > 0 && (
          <div className="rounded-xl bg-card p-6 shadow-card space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Top Genres</h2>
            <div className="space-y-2">
              {genres.map(g => (
                <div key={g.name} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-24 shrink-0 truncate">{g.name}</span>
                  <div className="flex-1 h-5 rounded bg-secondary overflow-hidden">
                    <div className="h-full rounded bg-primary/80 transition-all" style={{ width: `${(g.count / maxGenre) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

export default StatsPage;
