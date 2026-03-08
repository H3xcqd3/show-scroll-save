const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: string = 'w500') => {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null) => getImageUrl(path, 'w1280');

export type MediaType = 'movie' | 'tv';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: MediaType;
  genre_ids?: number[];
  popularity: number;
}

export interface MediaDetail extends MediaItem {
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres: { id: number; name: string }[];
  tagline?: string;
  status: string;
  homepage?: string;
  imdb_id?: string;
  external_ids?: { imdb_id?: string; tvdb_id?: number };
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
  videos?: {
    results: { key: string; site: string; type: string; name: string }[];
  };
  similar?: { results: MediaItem[] };
  seasons?: TvSeason[];
}

export interface TvSeason {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  overview: string;
}

export interface TvEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface TvSeasonDetail {
  id: number;
  season_number: number;
  name: string;
  episodes: TvEpisode[];
}

export interface PersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  also_known_as: string[];
  external_ids?: { imdb_id?: string };
  combined_credits?: {
    cast: (MediaItem & { character?: string })[];
  };
}

export const getDisplayTitle = (item: MediaItem) => item.title || item.name || 'Unknown';
export const getDisplayDate = (item: MediaItem) => item.release_date || item.first_air_date || '';
export const getYear = (item: MediaItem) => {
  const date = getDisplayDate(item);
  return date ? new Date(date).getFullYear() : '';
};

const getApiKey = () => localStorage.getItem('tmdb_api_key') || '';

const fetchTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('TMDB API key not set');
  
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
};

export const tmdb = {
  trending: (type: MediaType | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') =>
    fetchTMDB<{ results: MediaItem[] }>(`/trending/${type}/${timeWindow}`),

  search: (query: string, page = 1) =>
    fetchTMDB<{ results: MediaItem[]; total_results: number; total_pages: number }>(
      '/search/multi', { query, page: String(page) }
    ),

  movieDetails: (id: number) =>
    fetchTMDB<MediaDetail>(`/movie/${id}`, { append_to_response: 'credits,videos,similar,external_ids' }),

  tvDetails: (id: number) =>
    fetchTMDB<MediaDetail>(`/tv/${id}`, { append_to_response: 'credits,videos,similar,external_ids' }),

  popular: (type: MediaType, page = 1) =>
    fetchTMDB<{ results: MediaItem[] }>(`/${type}/popular`, { page: String(page) }),

  topRated: (type: MediaType, page = 1) =>
    fetchTMDB<{ results: MediaItem[] }>(`/${type}/top_rated`, { page: String(page) }),
};
