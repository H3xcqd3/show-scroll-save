import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Trash2, Plus, Loader2, Key, Check } from 'lucide-react';

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'mptl_';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

const ApiKeyManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const raw = generateApiKey();
      const keyHash = await hashKey(raw);
      const prefix = raw.slice(0, 9) + '...';

      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        key_hash: keyHash,
        key_prefix: prefix,
        name: keyName.trim() || 'Default',
      });
      if (error) throw error;

      setNewKey(raw);
      setKeyName('');
      queryClient.invalidateQueries({ queryKey: ['api-keys', user.id] });
      toast({ title: 'API key created' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['api-keys', user?.id] });
      toast({ title: 'API key deleted' });
    }
  };

  const handleCopy = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lists-api`;

  return (
    <div className="space-y-4">
      {newKey && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
          <p className="text-sm font-semibold text-primary">🔑 Save this key — it won't be shown again!</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-secondary px-3 py-2 text-xs font-mono text-foreground break-all">{newKey}</code>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setNewKey(null)} className="text-muted-foreground">Dismiss</Button>
        </div>
      )}

      {/* Create new key */}
      <div className="flex gap-2">
        <Input
          placeholder="Key name (e.g. Windows App)"
          value={keyName}
          onChange={e => setKeyName(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleCreate} disabled={creating} size="sm">
          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          Generate
        </Button>
      </div>

      {/* Existing keys */}
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : keys && keys.length > 0 ? (
        <div className="space-y-2">
          {keys.map(k => (
            <div key={k.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{k.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{k.key_prefix}</p>
                {k.last_used_at && (
                  <p className="text-xs text-muted-foreground">Last used: {new Date(k.last_used_at).toLocaleDateString()}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRevoke(k.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No API keys yet.</p>
      )}

      {/* Usage docs */}
      <div className="rounded-lg bg-secondary/30 p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Usage</p>
        <p className="text-xs text-muted-foreground">Send a GET request with your API key:</p>
        <code className="block rounded bg-secondary px-3 py-2 text-xs font-mono text-foreground break-all">
          GET {baseUrl}
          <br />Header: x-api-key: mptl_your_key_here
        </code>
        <p className="text-xs text-muted-foreground mt-1">Add <code className="text-foreground">?list_id=UUID</code> to get a specific list with all items.</p>
      </div>
    </div>
  );
};

export default ApiKeyManager;
