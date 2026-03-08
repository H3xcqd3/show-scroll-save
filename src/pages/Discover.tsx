import { useEffect, useState } from 'react';
import { tmdb, MediaItem } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import Navbar from '@/components/Navbar';
import LibrarySection from '@/components/LibrarySection';
import { Loader2 } from 'lucide-react';

const Discover = () => {
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTv, setPopularTv] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, m, tv] = await Promise.all([
          tmdb.trending('all', 'week'),
          tmdb.popular('movie'),
          tmdb.popular('tv'),
        ]);
        setTrending(t.results.slice(0, 12));
        setPopularMovies(m.results.slice(0, 12));
        setPopularTv(tv.results.slice(0, 12));
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
        <LibrarySection />
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">Discover</h1>
          <p className="text-muted-foreground">Trending movies & TV shows this week</p>
        </div>
        <MediaGrid items={trending} title="🔥 Trending" />
        <MediaGrid items={popularMovies} title="🎬 Popular Movies" mediaType="movie" />
        <MediaGrid items={popularTv} title="📺 Popular TV Shows" mediaType="tv" />
      </main>
    </>
  );
};

export default Discover;
