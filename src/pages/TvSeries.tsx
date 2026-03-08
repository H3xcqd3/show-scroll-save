import { useLibrary, LibraryItem } from '@/hooks/useLibrary';
import { getImageUrl } from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { Star, Trash2, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const TvSeries = () => {
  const { library, removeFromLibrary } = useLibrary();
  const items = library.filter(l => l.mediaType === 'tv');

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">TV Series</h1>
          <p className="text-muted-foreground">Your saved TV shows</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Tv className="h-12 w-12 mb-4 opacity-50" />
            <p>No TV series saved yet</p>
            <Link to="/search" className="mt-2 text-primary text-sm hover:underline">
              Search for shows to add
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item: LibraryItem) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-4 rounded-xl bg-card p-3 shadow-card"
                >
                  <Link to={`/tv/${item.id}`} className="shrink-0">
                    {item.posterPath ? (
                      <img src={getImageUrl(item.posterPath, 'w154')!} alt={item.title} className="h-20 w-14 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-20 w-14 items-center justify-center rounded-lg bg-secondary text-xs text-muted-foreground">N/A</div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/tv/${item.id}`} className="hover:underline">
                      <p className="font-display font-semibold text-foreground truncate">{item.title}</p>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {item.year && <span>{item.year}</span>}
                      {item.voteAverage > 0 && (
                        <span className="flex items-center gap-0.5 text-primary">
                          <Star className="h-3 w-3 fill-primary" /> {item.voteAverage.toFixed(1)}
                        </span>
                      )}
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider">{item.status}</span>
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

export default TvSeries;
