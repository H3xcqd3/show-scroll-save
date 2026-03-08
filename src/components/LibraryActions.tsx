import { Bookmark, Eye, Play, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaItem, MediaType } from '@/lib/tmdb';
import { LibraryStatus, useLibrary } from '@/hooks/useLibrary';

interface LibraryActionsProps {
  item: MediaItem;
  mediaType: MediaType;
}

const LibraryActions = ({ item, mediaType }: LibraryActionsProps) => {
  const { addToLibrary, removeFromLibrary, getStatus } = useLibrary();
  const currentStatus = getStatus(item.id, mediaType);

  const actions: { status: LibraryStatus; icon: typeof Bookmark; label: string }[] = [
    { status: 'watchlist', icon: Bookmark, label: 'Watchlist' },
    { status: 'watching', icon: Play, label: 'Watching' },
    { status: 'watched', icon: Eye, label: 'Watched' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ status, icon: Icon, label }) => {
        const isActive = currentStatus === status;
        return (
          <Button
            key={status}
            variant={isActive ? 'default' : 'secondary'}
            size="sm"
            onClick={() => {
              if (isActive) {
                removeFromLibrary(item.id, mediaType);
              } else {
                addToLibrary(item, mediaType, status);
              }
            }}
            className="gap-1.5"
          >
            {isActive ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            {label}
          </Button>
        );
      })}
    </div>
  );
};

export default LibraryActions;
