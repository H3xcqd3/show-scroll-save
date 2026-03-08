import { MediaItem, MediaType } from '@/lib/tmdb';
import MediaCard from './MediaCard';

interface MediaGridProps {
  items: MediaItem[];
  mediaType?: MediaType;
  title?: string;
}

const MediaGrid = ({ items, mediaType, title }: MediaGridProps) => {
  if (!items.length) return null;

  return (
    <section>
      {title && (
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <MediaCard key={`${item.id}-${item.media_type || mediaType}`} item={item} mediaType={mediaType} />
        ))}
      </div>
    </section>
  );
};

export default MediaGrid;
