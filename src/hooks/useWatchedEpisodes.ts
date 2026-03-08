import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WatchedKey {
  tv_id: number;
  season_number: number;
  episode_number: number;
}

const toKey = (k: WatchedKey) => `${k.tv_id}-s${k.season_number}-e${k.episode_number}`;

export const useWatchedEpisodes = () => {
  const { user } = useAuth();
  const [watched, setWatched] = useState<Set<string>>(new Set());

  const fetchWatched = useCallback(async () => {
    if (!user) { setWatched(new Set()); return; }
    const { data } = await supabase
      .from('watched_episodes')
      .select('tv_id, season_number, episode_number')
      .eq('user_id', user.id);
    if (data) {
      setWatched(new Set(data.map(r => toKey(r))));
    }
  }, [user]);

  useEffect(() => { fetchWatched(); }, [fetchWatched]);

  const isWatched = useCallback((tvId: number, season: number, episode: number) => {
    return watched.has(toKey({ tv_id: tvId, season_number: season, episode_number: episode }));
  }, [watched]);

  const toggleWatched = useCallback(async (tvId: number, season: number, episode: number) => {
    if (!user) return;
    const key = toKey({ tv_id: tvId, season_number: season, episode_number: episode });
    if (watched.has(key)) {
      await supabase.from('watched_episodes').delete()
        .eq('user_id', user.id).eq('tv_id', tvId).eq('season_number', season).eq('episode_number', episode);
    } else {
      await supabase.from('watched_episodes').insert({
        user_id: user.id, tv_id: tvId, season_number: season, episode_number: episode,
      });
    }
    fetchWatched();
  }, [user, watched, fetchWatched]);

  const markSeasonWatched = useCallback(async (tvId: number, season: number, episodes: number[]) => {
    if (!user) return;
    const rows = episodes.map(ep => ({
      user_id: user.id, tv_id: tvId, season_number: season, episode_number: ep,
    }));
    await supabase.from('watched_episodes').upsert(rows, { onConflict: 'user_id,tv_id,season_number,episode_number' });
    fetchWatched();
  }, [user, fetchWatched]);

  const unmarkSeasonWatched = useCallback(async (tvId: number, season: number, episodes: number[]) => {
    if (!user) return;
    for (const ep of episodes) {
      await supabase.from('watched_episodes').delete()
        .eq('user_id', user.id).eq('tv_id', tvId).eq('season_number', season).eq('episode_number', ep);
    }
    fetchWatched();
  }, [user, fetchWatched]);

  const getSeasonProgress = useCallback((tvId: number, season: number, totalEpisodes: number) => {
    let count = 0;
    for (let i = 1; i <= totalEpisodes; i++) {
      if (watched.has(toKey({ tv_id: tvId, season_number: season, episode_number: i }))) count++;
    }
    return count;
  }, [watched]);

  return { isWatched, toggleWatched, markSeasonWatched, unmarkSeasonWatched, getSeasonProgress };
};
