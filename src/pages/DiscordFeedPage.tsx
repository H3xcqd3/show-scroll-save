import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Hash, Wifi, WifiOff, RefreshCw, Settings2, Send } from 'lucide-react';

interface DiscordMember {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  avatar_url: string;
  status: string;
  game?: { name: string };
}

interface DiscordChannel {
  id: string;
  name: string;
  position: number;
}

interface DiscordWidget {
  id: string;
  name: string;
  instant_invite: string | null;
  presence_count: number;
  members: DiscordMember[];
  channels: DiscordChannel[];
}

const GUILD_STORAGE_KEY = 'discord_guild_id';

const DiscordFeedPage = () => {
  const [guildId, setGuildId] = useState(() => localStorage.getItem(GUILD_STORAGE_KEY) || '');
  const [inputId, setInputId] = useState('');
  const [widget, setWidget] = useState<DiscordWidget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchWidget = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://discord.com/api/guilds/${id}/widget.json`);
      if (!res.ok) {
        if (res.status === 403) throw new Error('Widget is disabled for this server. Enable it in Server Settings → Widget.');
        if (res.status === 404) throw new Error('Server not found. Check the server ID.');
        throw new Error(`Discord API error: ${res.status}`);
      }
      const data: DiscordWidget = await res.json();
      setWidget(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (guildId) fetchWidget(guildId);
  }, [guildId, fetchWidget]);

  useEffect(() => {
    if (!guildId || !autoRefresh) return;
    const interval = setInterval(() => fetchWidget(guildId), 30000);
    return () => clearInterval(interval);
  }, [guildId, autoRefresh, fetchWidget]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputId.trim();
    if (!trimmed) return;
    localStorage.setItem(GUILD_STORAGE_KEY, trimmed);
    setGuildId(trimmed);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(GUILD_STORAGE_KEY);
    setGuildId('');
    setWidget(null);
    setInputId('');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-muted-foreground/50';
    }
  };

  if (!guildId) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-16 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <Settings2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Connect to Discord</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Enter your Discord server ID to display live activity. Make sure the <strong>Server Widget</strong> is enabled in your Discord server settings.
            </p>
          </div>
          <form onSubmit={handleConnect} className="flex gap-2 max-w-sm mx-auto">
            <Input
              placeholder="Server ID (e.g. 123456789)"
              value={inputId}
              onChange={e => setInputId(e.target.value)}
              required
            />
            <Button type="submit">Connect</Button>
          </form>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>How to find your Server ID:</p>
            <p>Enable Developer Mode → Right-click server → Copy Server ID</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {widget?.name || 'Discord Feed'}
            </h1>
            {widget && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Wifi className="h-3.5 w-3.5 text-green-500" />
                {widget.presence_count} online
                {autoRefresh && ' · auto-refreshing'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchWidget(guildId)} disabled={loading} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-1.5"
            >
              {autoRefresh ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {autoRefresh ? 'Live' : 'Paused'}
            </Button>
            {widget?.instant_invite && (
              <Button size="sm" asChild className="gap-1.5">
                <a href={widget.instant_invite} target="_blank" rel="noopener noreferrer">
                  <Send className="h-3.5 w-3.5" /> Join
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-muted-foreground">
              Disconnect
            </Button>
          </div>
        </div>

        {loading && !widget && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {widget && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Members */}
            <div className="md:col-span-2 space-y-3">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Online Members ({widget.members.length})
              </h2>
              <div className="rounded-xl bg-card border border-border shadow-card divide-y divide-border">
                {widget.members.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No members visible via widget.</p>
                ) : (
                  widget.members.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3">
                      <div className="relative">
                        <img
                          src={member.avatar_url}
                          alt={member.username}
                          className="h-9 w-9 rounded-full bg-secondary"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${statusColor(member.status)}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{member.username}</p>
                        {member.game && (
                          <p className="text-xs text-muted-foreground truncate">Playing {member.game.name}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{member.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Channels */}
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <Hash className="h-5 w-5 text-primary" />
                Channels ({widget.channels.length})
              </h2>
              <div className="rounded-xl bg-card border border-border shadow-card divide-y divide-border">
                {widget.channels.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No channels visible via widget.</p>
                ) : (
                  widget.channels
                    .sort((a, b) => a.position - b.position)
                    .map(channel => (
                      <div key={channel.id} className="flex items-center gap-2 p-3">
                        <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{channel.name}</span>
                      </div>
                    ))
                )}
              </div>

              {/* Quick Stats */}
              <div className="rounded-xl bg-card border border-border shadow-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Server Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Online</span>
                    <span className="font-medium text-foreground">{widget.presence_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Channels</span>
                    <span className="font-medium text-foreground">{widget.channels.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Server ID</span>
                    <span className="font-mono text-xs text-muted-foreground">{widget.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default DiscordFeedPage;
