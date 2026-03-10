import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomLists } from '@/hooks/useCustomLists';
import { useLibrary } from '@/hooks/useLibrary';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Globe, Lock, Loader2, ListPlus, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ListsPage = () => {
  const { lists, loading, createList, deleteList } = useCustomLists();
  const { library } = useLibrary();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const watchlistCount = library.filter(i => i.status === 'watchlist').length;
  const watchingCount = library.filter(i => i.status === 'watching').length;
  const watchedCount = library.filter(i => i.status === 'watched').length;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await createList(newName.trim());
    setNewName('');
    setCreating(false);
    toast({ title: 'List created' });
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">My Lists</h1>
          <p className="text-muted-foreground">Create themed collections</p>
        </div>

        {/* Standard Library Lists */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Library</p>
          <Link to="/library" className="flex items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <Bookmark className="h-5 w-5 text-primary" />
              <div>
                <p className="font-display font-semibold text-foreground">Watchlist</p>
                <p className="text-xs text-muted-foreground">{watchlistCount} items</p>
              </div>
            </div>
          </Link>
          <Link to="/library" className="flex items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 flex items-center justify-center text-primary">▶</div>
              <div>
                <p className="font-display font-semibold text-foreground">Watching</p>
                <p className="text-xs text-muted-foreground">{watchingCount} items</p>
              </div>
            </div>
          </Link>
          <Link to="/library" className="flex items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 flex items-center justify-center text-primary">✓</div>
              <div>
                <p className="font-display font-semibold text-foreground">Watched</p>
                <p className="text-xs text-muted-foreground">{watchedCount} items</p>
              </div>
            </div>
          </Link>
        </div>

        {lists.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Custom Lists</p>
            <AnimatePresence mode="popLayout">
              {lists.map(list => (
                <motion.div
                  key={list.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Link
                    to={`/lists/${list.id}`}
                    className="flex items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-display font-semibold text-foreground">{list.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {list.is_public ? (
                            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Public</span>
                          ) : (
                            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Private</span>
                          )}
                          <span>Created {new Date(list.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.preventDefault(); deleteList(list.id); }}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="border-t border-border" />

        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Create New List</p>

        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New list name..."
            className="flex-1"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="gap-1.5 shrink-0">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </Button>
        </div>
      </main>
    </>
  );
};

export default ListsPage;
