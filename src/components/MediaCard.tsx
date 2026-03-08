import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Bookmark, Play, Eye, Check } from 'lucide-react';
import { MediaItem, getDisplayTitle, getYear, getImageUrl, MediaType } from '@/lib/tmdb';
import { useLibrary, LibraryStatus } from '@/hooks/useLibrary';

interface MediaCardProps {
  item: MediaItem;
  mediaType?: MediaType;
}

const statusActions: { status: LibraryStatus; icon: typeof Bookmark; label: string }[] = [
  { status: 'watchlist', icon: Bookmark, label: 'Watchlist' },
  { status: 'watching', icon: Play, label: 'Watching' },
  { status: 'watched', icon: Eye, label: 'Watched' },
];

const MediaCard = ({ item, mediaType }: MediaCardProps) => {
  const type = item.media_type || mediaType || 'movie';
  const poster = getImageUrl(item.poster_path, 'w342');
  const title = getDisplayTitle(item);
  const year = getYear(item);
  const { addToLibrary, removeFromLibrary, getStatus } = useLibrary();
  const currentStatus = getStatus(item.id, type as MediaType);

  return (
    <div>
      <Link to={`/${type}/${item.id}`}>
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.2 }}
          className="group relative overflow-hidden rounded-xl bg-card shadow-card"
        >
          <div className="aspect-[2/3] overflow-hidden">
            {poster ? (
              <img
                src={poster}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-3 pt-12">
            <p className="font-display text-sm font-semibold text-foreground leading-tight line-clamp-2">{title}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {year && <span>{year}</span>}
              {item.vote_average > 0 && (
                <span className="flex items-center gap-0.5 text-primary">
                  <Star className="h-3 w-3 fill-primary" />
                  {item.vote_average.toFixed(1)}
                </span>
              )}
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                {type}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
      <div className="flex gap-1 mt-1.5">
        {statusActions.map(({ status, icon: Icon, label }) => {
          const isActive = currentStatus === status;
          return (
            <button
              key={status}
              onClick={() => {
                if (isActive) {
                  removeFromLibrary(item.id, type as MediaType);
                } else {
                  addToLibrary(item, type as MediaType, status);
                }
              }}
              className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
              title={label}
            >
              {isActive ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MediaCard;
