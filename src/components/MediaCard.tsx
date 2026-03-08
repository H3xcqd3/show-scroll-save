import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { MediaItem, getDisplayTitle, getYear, getImageUrl, MediaType } from '@/lib/tmdb';

interface MediaCardProps {
  item: MediaItem;
  mediaType?: MediaType;
}

const MediaCard = ({ item, mediaType }: MediaCardProps) => {
  const type = item.media_type || mediaType || 'movie';
  const poster = getImageUrl(item.poster_path, 'w342');
  const title = getDisplayTitle(item);
  const year = getYear(item);

  return (
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
  );
};

export default MediaCard;
