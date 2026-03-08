import { useEffect, useState } from 'react';
import { tmdb, MediaItem } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

const TvSeries = () => {
  const [popular, setPopular] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t] = await Promise.all([
          tmdb.popular('tv'),
          tmdb.topRated('tv'),
        ]);
        setPopular(p.results.slice(0, 18));
        setTopRated(t.results.slice(0, 18));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">TV Series</h1>
          <p className="text-muted-foreground">Popular and top rated TV shows</p>
        </div>
        <MediaGrid items={popular} title="📺 Popular TV Shows" mediaType="tv" />
        <MediaGrid items={topRated} title="⭐ Top Rated TV Shows" mediaType="tv" />
      </main>
    </>
  );
};

export default TvSeries;
