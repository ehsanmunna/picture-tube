export type LibraryType = 'Movies' | 'TV-Series';

export interface LibraryItem {
  id: string;
  server_id: string;
  type: LibraryType;
  language: string | null;
  title: string; // movie: 'Traitors [2013]' | episode: 'Episode 1'
  series_title: string | null;
  season: number | null;
  episode: number | null;
  year: number | null;
  ext: string | null;
  url: string;
}

export interface LibraryFilter {
  search?: string;
  type?: LibraryType;
  language?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

/** One card in the library grid/list: a movie, or a whole series grouped. */
export interface LibraryCard {
  kind: 'movie' | 'series';
  id: string;
  title: string; // movie title or series title
  language: string | null;
  year: number | null;
  url: string | null; // playable url for movies, null for series
  episode_count: number | null; // series only
}
