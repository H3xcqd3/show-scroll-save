import { useEffect, useState } from 'react';
import { tmdb, MediaItem } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

const Films = () => {
  const [popular, setPopular] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t] = await Promise.all([
          tmdb.popular('movie'),
          tmdb.topRated('movie'),
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
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">Films</h1>
          <p className="text-muted-foreground">Popular and top rated movies</p>
        </div>
        <MediaGrid items={popular} title="🎬 Popular Movies" mediaType="movie" />
        <MediaGrid items={topRated} title="⭐ Top Rated Movies" mediaType="movie" />
      </main>
    </>
  );
};

export default Films;
