import { useState, useEffect, useCallback } from 'react';

interface WatchedKey {
  tv_id: number;
  season_number: number;
  episode_number: number;
}

const STORAGE_KEY = 'cinetrack_watched_episodes';
const toKey = (k: WatchedKey) => `${k.tv_id}-s${k.season_number}-e${k.episode_number}`;

const loadFromStorage = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

const saveToStorage = (watched: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...watched]));
};

export const useWatchedEpisodes = () => {
  const [watched, setWatched] = useState<Set<string>>(() => loadFromStorage());

  useEffect(() => { saveToStorage(watched); }, [watched]);

  const isWatched = useCallback((tvId: number, season: number, episode: number) => {
    return watched.has(toKey({ tv_id: tvId, season_number: season, episode_number: episode }));
  }, [watched]);

  const toggleWatched = useCallback(async (tvId: number, season: number, episode: number) => {
    const key = toKey({ tv_id: tvId, season_number: season, episode_number: episode });
    setWatched(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const markSeasonWatched = useCallback(async (tvId: number, season: number, episodes: number[]) => {
    setWatched(prev => {
      const next = new Set(prev);
      episodes.forEach(ep => next.add(toKey({ tv_id: tvId, season_number: season, episode_number: ep })));
      return next;
    });
  }, []);

  const unmarkSeasonWatched = useCallback(async (tvId: number, season: number, episodes: number[]) => {
    setWatched(prev => {
      const next = new Set(prev);
      episodes.forEach(ep => next.delete(toKey({ tv_id: tvId, season_number: season, episode_number: ep })));
      return next;
    });
  }, []);

  const getSeasonProgress = useCallback((tvId: number, season: number, totalEpisodes: number) => {
    let count = 0;
    for (let i = 1; i <= totalEpisodes; i++) {
      if (watched.has(toKey({ tv_id: tvId, season_number: season, episode_number: i }))) count++;
    }
    return count;
  }, [watched]);

  return { isWatched, toggleWatched, markSeasonWatched, unmarkSeasonWatched, getSeasonProgress };
};
