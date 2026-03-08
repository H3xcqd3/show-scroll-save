import { useLibrary } from '@/hooks/useLibrary';
import MediaCard from './MediaCard';
import { MediaItem } from '@/lib/tmdb';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const LibrarySection = () => {
  const { library, getByStatus } = useLibrary();
  const watchlist = getByStatus('watchlist');

  if (library.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-bold text-foreground">📋 My Watchlist</h2>
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <BookOpen className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">No items in your watchlist yet</p>
          <Link to="/search" className="mt-2 text-primary text-sm hover:underline">
            Search for something to add
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {watchlist.map((item) => {
            const mediaItem: MediaItem = {
              id: item.id,
              media_type: item.mediaType,
              poster_path: item.posterPath,
              vote_average: item.voteAverage,
              title: item.mediaType === 'movie' ? item.title : undefined,
              name: item.mediaType === 'tv' ? item.title : undefined,
              release_date: item.mediaType === 'movie' ? item.year : undefined,
              first_air_date: item.mediaType === 'tv' ? item.year : undefined,
            } as MediaItem;
            return (
              <MediaCard key={`${item.id}-${item.mediaType}`} item={mediaItem} mediaType={item.mediaType} />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default LibrarySection;
