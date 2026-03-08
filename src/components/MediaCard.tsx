import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Bookmark, Play, Eye, Check, ListPlus } from 'lucide-react';
import { MediaItem, getDisplayTitle, getYear, getImageUrl, MediaType } from '@/lib/tmdb';
import { useLibrary, LibraryStatus } from '@/hooks/useLibrary';
import { useCustomLists } from '@/hooks/useCustomLists';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
interface MediaCardProps {
  item: MediaItem;
  mediaType?: MediaType;
}


const MediaCard = ({ item, mediaType }: MediaCardProps) => {
  const type = item.media_type || mediaType || 'movie';
  const poster = getImageUrl(item.poster_path, 'w342');
  const title = getDisplayTitle(item);
  const year = getYear(item);
  const { addToLibrary, removeFromLibrary, getStatus } = useLibrary();
  const { lists, addItem } = useCustomLists();
  const { toast } = useToast();
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors ${
                currentStatus === 'watchlist'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {currentStatus === 'watchlist' ? <Check className="h-3 w-3" /> : <ListPlus className="h-3 w-3" />}
              Add to List
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => {
                if (currentStatus === 'watchlist') {
                  removeFromLibrary(item.id, type as MediaType);
                } else {
                  addToLibrary(item, type as MediaType, 'watchlist');
                }
              }}
              className="gap-2"
            >
              {currentStatus === 'watchlist' ? <Check className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
              Watchlist
            </DropdownMenuItem>
            {lists.map(list => (
              <DropdownMenuItem
                key={list.id}
                onClick={() => {
                  addItem(list.id, item, type as MediaType);
                  setAddedTo(prev => new Set(prev).add(list.id));
                  toast({ title: `Added to "${list.name}"` });
                }}
                className="gap-2"
              >
                {addedTo.has(list.id) ? <Check className="h-3.5 w-3.5 text-primary" /> : <ListPlus className="h-3.5 w-3.5" />}
                {list.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={() => {
            if (currentStatus === 'watched') {
              removeFromLibrary(item.id, type as MediaType);
            } else {
              addToLibrary(item, type as MediaType, 'watched');
            }
          }}
          className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors ${
            currentStatus === 'watched'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
          title="Watched"
        >
          {currentStatus === 'watched' ? <Check className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          Watched
        </button>
      </div>
    </div>
  );
};

export default MediaCard;
