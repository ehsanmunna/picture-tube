import { getDb } from './connection';
import type { LibraryCard, LibraryFilter, LibraryItem } from './types';

const UPSERT_SQL = `
  INSERT INTO library_items
    (id, server_id, type, language, title, series_title, season, episode, year, ext, url)
  VALUES
    ($id, $server_id, $type, $language, $title, $series_title, $season, $episode, $year, $ext, $url)
  ON CONFLICT(url) DO UPDATE SET
    server_id    = excluded.server_id,
    type         = excluded.type,
    language     = excluded.language,
    title        = excluded.title,
    series_title = excluded.series_title,
    season       = excluded.season,
    episode      = excluded.episode,
    year         = excluded.year,
    ext          = excluded.ext
`;

/** Insert or update many items in a single transaction. Returns how many were written. */
export async function upsertItems(items: LibraryItem[]): Promise<number> {
  if (!items.length) return 0;
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(UPSERT_SQL);
    try {
      for (const it of items) {
        await stmt.executeAsync({
          $id: it.id,
          $server_id: it.server_id,
          $type: it.type,
          $language: it.language,
          $title: it.title,
          $series_title: it.series_title,
          $season: it.season,
          $episode: it.episode,
          $year: it.year,
          $ext: it.ext,
          $url: it.url,
        });
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });

  return items.length;
}

/**
 * Library grid/list: movies as individual cards, TV series grouped into ONE card each.
 * A year filter applies to movies only (series have no year), so it hides series.
 */
export async function queryLibrary(filter: LibraryFilter = {}): Promise<LibraryCard[]> {
  const db = await getDb();
  const { search, type, language, year, limit = 60, offset = 0 } = filter;

  const like = search?.trim() ? `%${search.trim()}%` : null;
  const parts: string[] = [];
  const params: (string | number)[] = [];

  if (!type || type === 'Movies') {
    let sql = `
      SELECT 'movie' AS kind, id, title, language, year, url, NULL AS episode_count
      FROM library_items WHERE type = 'Movies'`;
    if (language) { sql += ' AND language = ?'; params.push(language); }
    if (year)     { sql += ' AND year = ?';     params.push(year); }
    if (like)     { sql += ' AND title LIKE ?'; params.push(like); }
    parts.push(sql);
  }

  if ((!type || type === 'TV-Series') && !year) {
    let sql = `
      SELECT 'series' AS kind, MIN(id) AS id, series_title AS title, language,
             NULL AS year, NULL AS url, COUNT(*) AS episode_count
      FROM library_items WHERE type = 'TV-Series'`;
    if (language) { sql += ' AND language = ?';     params.push(language); }
    if (like)     { sql += ' AND series_title LIKE ?'; params.push(like); }
    sql += ' GROUP BY series_title, language';
    parts.push(sql);
  }

  if (!parts.length) return [];

  const sql = `${parts.join(' UNION ALL ')} ORDER BY title COLLATE NOCASE LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  return db.getAllAsync<LibraryCard>(sql, params);
}

/** Episodes of one series, ordered season then episode. */
export async function getEpisodes(seriesTitle: string, language: string | null): Promise<LibraryItem[]> {
  const db = await getDb();
  return db.getAllAsync<LibraryItem>(
    `SELECT * FROM library_items
     WHERE type = 'TV-Series' AND series_title = ? AND language IS ?
     ORDER BY season, episode`,
    [seriesTitle, language],
  );
}

/** Values for the language and year dropdowns. */
export async function getFilterOptions(): Promise<{ languages: string[]; years: number[] }> {
  const db = await getDb();
  const langs = await db.getAllAsync<{ language: string }>(
    'SELECT DISTINCT language FROM library_items WHERE language IS NOT NULL ORDER BY language',
  );
  const years = await db.getAllAsync<{ year: number }>(
    'SELECT DISTINCT year FROM library_items WHERE year IS NOT NULL ORDER BY year DESC',
  );
  return { languages: langs.map(l => l.language), years: years.map(y => y.year) };
}

/** Which of these urls are already in the library (to show "added" state on tree nodes). */
export async function getExistingUrls(urls: string[]): Promise<Set<string>> {
  if (!urls.length) return new Set();
  const db = await getDb();
  const found = new Set<string>();
  const CHUNK = 500; // stay under SQLite's variable limit
  for (let i = 0; i < urls.length; i += CHUNK) {
    const slice = urls.slice(i, i + CHUNK);
    const rows = await db.getAllAsync<{ url: string }>(
      `SELECT url FROM library_items WHERE url IN (${slice.map(() => '?').join(',')})`,
      slice,
    );
    rows.forEach(r => found.add(r.url));
  }
  return found;
}

export async function removeByServer(serverId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM library_items WHERE server_id = ?', [serverId]);
}

export async function countItems(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM library_items');
  return row?.n ?? 0;
}
