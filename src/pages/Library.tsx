import { useState } from 'react';
import { useLibrary, LibraryStatus, LibraryItem } from '@/hooks/useLibrary';
import { getImageUrl } from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { Star, Trash2, BookOpen, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const statusTabs: { status: LibraryStatus; label: string; emoji: string }[] = [
  { status: 'watchlist', label: 'Watchlist', emoji: '📋' },
  { status: 'watching', label: 'Watching', emoji: '▶️' },
  { status: 'watched', label: 'Watched', emoji: '✅' },
];

type MediaFilter = 'all' | 'movie' | 'tv';

const mediaFilters: { value: MediaFilter; label: string; icon: typeof BookOpen }[] = [
  { value: 'all', label: 'All', icon: BookOpen },
  { value: 'movie', label: 'Movies', icon: Film },
  { value: 'tv', label: 'TV Shows', icon: Tv },
];

const Library = () => {
  const { getByStatus, removeFromLibrary } = useLibrary();
  const [activeTab, setActiveTab] = useState<LibraryStatus>('watchlist');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');

  const allItems = getByStatus(activeTab);
  const items = mediaFilter === 'all' ? allItems : allItems.filter(i => i.mediaType === mediaFilter);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">My Library</h1>
          <p className="text-muted-foreground">Track what you're watching</p>
        </div>

        {/* Media type filter */}
        <div className="flex gap-2">
          {mediaFilters.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setMediaFilter(value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mediaFilter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 rounded-xl bg-secondary p-1">
          {statusTabs.map(tab => (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.status
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.emoji} {tab.label} ({getByStatus(tab.status).filter(i => mediaFilter === 'all' || i.mediaType === mediaFilter).length})
            </button>
          ))}
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4 opacity-50" />
            <p>No items in your {activeTab} yet</p>
            <Link to="/search" className="mt-2 text-primary text-sm hover:underline">
              Search for something to add
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item: LibraryItem) => (
                <motion.div
                  key={`${item.id}-${item.mediaType}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-4 rounded-xl bg-card p-3 shadow-card"
                >
                  <Link to={`/${item.mediaType}/${item.id}`} className="shrink-0">
                    {item.posterPath ? (
                      <img src={getImageUrl(item.posterPath, 'w154')!} alt={item.title} className="h-20 w-14 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-20 w-14 items-center justify-center rounded-lg bg-secondary text-xs text-muted-foreground">N/A</div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/${item.mediaType}/${item.id}`} className="hover:underline">
                      <p className="font-display font-semibold text-foreground truncate">{item.title}</p>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {item.year && <span>{item.year}</span>}
                      {item.voteAverage > 0 && (
                        <span className="flex items-center gap-0.5 text-primary">
                          <Star className="h-3 w-3 fill-primary" /> {item.voteAverage.toFixed(1)}
                        </span>
                      )}
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider">{item.mediaType}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromLibrary(item.id, item.mediaType)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </>
  );
};

export default Library;
