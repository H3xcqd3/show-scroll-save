import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cinetrack_watched_episodes';

interface WatchedEpisodes {
  [key: string]: boolean; // key: `${tvId}-s${season}-e${episode}`
}

const load = (): WatchedEpisodes => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

export const useWatchedEpisodes = () => {
  const [watched, setWatched] = useState<WatchedEpisodes>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
  }, [watched]);

  const getKey = (tvId: number, season: number, episode: number) =>
    `${tvId}-s${season}-e${episode}`;

  const isWatched = useCallback((tvId: number, season: number, episode: number) => {
    return !!watched[getKey(tvId, season, episode)];
  }, [watched]);

  const toggleWatched = useCallback((tvId: number, season: number, episode: number) => {
    setWatched(prev => {
      const key = getKey(tvId, season, episode);
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  }, []);

  const markSeasonWatched = useCallback((tvId: number, season: number, episodes: number[]) => {
    setWatched(prev => {
      const next = { ...prev };
      episodes.forEach(ep => { next[getKey(tvId, season, ep)] = true; });
      return next;
    });
  }, []);

  const unmarkSeasonWatched = useCallback((tvId: number, season: number, episodes: number[]) => {
    setWatched(prev => {
      const next = { ...prev };
      episodes.forEach(ep => { delete next[getKey(tvId, season, ep)]; });
      return next;
    });
  }, []);

  const getSeasonProgress = useCallback((tvId: number, season: number, totalEpisodes: number) => {
    let count = 0;
    for (let i = 1; i <= totalEpisodes; i++) {
      if (watched[getKey(tvId, season, i)]) count++;
    }
    return count;
  }, [watched]);

  return { isWatched, toggleWatched, markSeasonWatched, unmarkSeasonWatched, getSeasonProgress };
};
