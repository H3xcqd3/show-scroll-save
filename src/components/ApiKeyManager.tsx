import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Key, Copy, Trash2, Plus, Loader2, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

const ApiKeyManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  const fetchKeys = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('revoked', false)
      .order('created_at', { ascending: false });
    setKeys((data as any[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const generateKey = async () => {
    if (!user) return;
    setGenerating(true);

    // Generate a random API key
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const rawKey = 'sss_' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    const prefix = rawKey.slice(0, 12) + '...';

    // Hash the key
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey));
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase.from('api_keys').insert({
      user_id: user.id,
      key_hash: keyHash,
      key_prefix: prefix,
      name: newKeyName || 'Default',
    } as any);

    setGenerating(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setRevealedKey(rawKey);
      setNewKeyName('');
      fetchKeys();
      toast({ title: 'API key generated', description: 'Copy it now — you won\'t be able to see it again.' });
    }
  };

  const revokeKey = async (id: string) => {
    await supabase.from('api_keys').update({ revoked: true } as any).eq('id', id);
    fetchKeys();
    toast({ title: 'API key revoked' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const baseUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-project'}.supabase.co/functions/v1/library-api`;

  return (
    <div className="rounded-xl bg-card p-6 shadow-card space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Key className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">API Keys</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Generate API keys to manage your library from external apps.
      </p>

      {/* Generate new key */}
      <div className="flex gap-2">
        <Input
          value={newKeyName}
          onChange={e => setNewKeyName(e.target.value)}
          placeholder="Key name (e.g. My App)"
          className="flex-1"
        />
        <Button onClick={generateKey} disabled={generating} className="gap-1.5 shrink-0">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Generate
        </Button>
      </div>

      {/* Revealed key */}
      {revealedKey && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">⚠️ Copy your key now — it won't be shown again:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-secondary p-2 rounded break-all text-foreground">{revealedKey}</code>
            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(revealedKey)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setRevealedKey(null)}>Dismiss</Button>
        </div>
      )}

      {/* Existing keys */}
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active API keys.</p>
      ) : (
        <div className="space-y-2">
          {keys.map(k => (
            <div key={k.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{k.name}</p>
                <p className="text-xs text-muted-foreground">
                  <code>{k.key_prefix}</code> · Created {new Date(k.created_at).toLocaleDateString()}
                  {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => revokeKey(k.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* API docs toggle */}
      <Button variant="outline" size="sm" onClick={() => setShowDocs(!showDocs)} className="gap-1.5">
        {showDocs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {showDocs ? 'Hide' : 'Show'} API Docs
      </Button>

      {showDocs && (
        <div className="rounded-lg bg-secondary p-4 space-y-3 text-sm">
          <p className="font-medium text-foreground">Base URL:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-card p-2 rounded break-all flex-1 text-foreground">{baseUrl}</code>
            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(baseUrl)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          <p className="font-medium text-foreground mt-3">Authentication:</p>
          <p className="text-muted-foreground">Include header: <code className="text-primary">x-api-key: your_key_here</code></p>

          <p className="font-medium text-foreground mt-3">Endpoints:</p>
          <div className="space-y-2 text-muted-foreground">
            <div>
              <code className="text-primary">GET /</code> — List library items
              <br />Query params: <code>status</code> (watchlist|watching|watched), <code>media_type</code> (movie|tv)
            </div>
            <div>
              <code className="text-primary">POST /</code> — Add item
              <br />Body: <code>{`{ "tmdb_id", "media_type", "title", "status", "poster_path?", "vote_average?", "year?" }`}</code>
            </div>
            <div>
              <code className="text-primary">PUT /?tmdb_id=X&media_type=Y</code> — Update status
              <br />Body: <code>{`{ "status": "watched" }`}</code>
            </div>
            <div>
              <code className="text-primary">DELETE /?tmdb_id=X&media_type=Y</code> — Remove item
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
