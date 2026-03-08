import { useLibrary } from '@/hooks/useLibrary';
import { useWatchedEpisodes } from '@/hooks/useWatchedEpisodes';
import MediaCard from './MediaCard';
import { MediaItem } from '@/lib/tmdb';
import { BookOpen, Film, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';

const LibrarySection = () => {
  const { library, getByStatus } = useLibrary();
  const { getSeasonProgress } = useWatchedEpisodes();
  const watchlist = getByStatus('watchlist');

  const movies = watchlist.filter(i => i.mediaType === 'movie');
  const tvShows = watchlist.filter(i => i.mediaType === 'tv');

  if (watchlist.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card/50 py-16">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <BookOpen className="h-10 w-10 mb-3 opacity-40" />
          <p className="font-display text-lg font-medium">Your watchlist will show here when you make one</p>
          <Link to="/search" className="mt-3 text-primary text-sm hover:underline">
            Search for something to add
          </Link>
        </div>
      </section>
    );
  }

  const toMediaItem = (item: typeof watchlist[0]): MediaItem => ({
    id: item.id,
    media_type: item.mediaType,
    poster_path: item.posterPath,
    vote_average: item.voteAverage,
    title: item.mediaType === 'movie' ? item.title : undefined,
    name: item.mediaType === 'tv' ? item.title : undefined,
    release_date: item.mediaType === 'movie' ? item.year : undefined,
    first_air_date: item.mediaType === 'tv' ? item.year : undefined,
  } as MediaItem);

  return (
    <section className="space-y-8">
      <h2 className="font-display text-xl font-bold text-foreground">📋 My Watchlist</h2>

      {movies.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Film className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">Films</h3>
            <span className="text-sm text-muted-foreground">({movies.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map(item => (
              <MediaCard key={`${item.id}-movie`} item={toMediaItem(item)} mediaType="movie" />
            ))}
          </div>
        </div>
      )}

      {tvShows.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tv className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">TV Shows</h3>
            <span className="text-sm text-muted-foreground">({tvShows.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {tvShows.map(item => (
              <TvWatchlistCard key={`${item.id}-tv`} item={item} toMediaItem={toMediaItem} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

// Separate component to fetch episode count per show
import { useEffect, useState } from 'react';
import { tmdb } from '@/lib/tmdb';

const TvWatchlistCard = ({ item, toMediaItem }: { item: any; toMediaItem: (i: any) => MediaItem }) => {
  const { getSeasonProgress } = useWatchedEpisodes();
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const details = await tmdb.tvDetails(item.id);
        const seasons = details.seasons?.filter(s => s.season_number > 0) || [];
        let total = 0;
        let watched = 0;
        for (const s of seasons) {
          total += s.episode_count;
          watched += getSeasonProgress(item.id, s.season_number, s.episode_count);
        }
        setTotalEpisodes(total);
        setWatchedCount(watched);
      } catch { /* ignore */ }
    };
    load();
  }, [item.id, getSeasonProgress]);

  return (
    <div>
      <MediaCard item={toMediaItem(item)} mediaType="tv" />
      {totalEpisodes > 0 && (
        <div className="mt-1 text-xs text-muted-foreground text-center">
          <span className="text-primary font-medium">{watchedCount}</span>/{totalEpisodes} episodes watched
        </div>
      )}
    </div>
  );
};

export default LibrarySection;
