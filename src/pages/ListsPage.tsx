import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomLists, CustomListItem } from '@/hooks/useCustomLists';
import Navbar from '@/components/Navbar';
import MediaCard from '@/components/MediaCard';
import { MediaItem } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Globe, Lock, Loader2, ListPlus, ArrowLeft, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ListsPage = () => {
  const { lists, loading, createList, deleteList, updateList } = useCustomLists();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

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

        {/* Create new */}
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ListPlus className="h-12 w-12 mb-4 opacity-50" />
            <p>No lists yet. Create one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
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
      </main>
    </>
  );
};

export default ListsPage;
