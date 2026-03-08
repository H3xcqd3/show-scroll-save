import { useState } from 'react';
import { tmdb, MediaItem } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await tmdb.search(query);
      setResults(data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="flex justify-center pt-4">
          <form onSubmit={handleSearch} className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies & TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-secondary border-border pl-11 text-lg text-foreground placeholder:text-muted-foreground"
            />
          </form>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No results found for "{query}"</p>
        )}

        {!loading && results.length > 0 && (
          <MediaGrid items={results} title={`Results for "${query}"`} />
        )}
      </main>
    </>
  );
};

export default SearchPage;
