import * as SQLite from 'expo-sqlite';

const DB_NAME = 'isplibrary.db';

/**
 * Each entry upgrades the schema by one version.
 * PRAGMA user_version tracks how many have been applied.
 * Never edit an old migration: add a new one.
 */
const MIGRATIONS: string[] = [
  // v1
  `
  CREATE TABLE IF NOT EXISTS library_items (
    id           TEXT PRIMARY KEY,
    server_id    TEXT NOT NULL,
    type         TEXT NOT NULL,
    language     TEXT,
    title        TEXT NOT NULL,
    series_title TEXT,
    season       INTEGER,
    episode      INTEGER,
    year         INTEGER,
    ext          TEXT,
    url          TEXT NOT NULL UNIQUE
  );
  CREATE INDEX IF NOT EXISTS idx_lib_filter ON library_items(type, language, year);
  CREATE INDEX IF NOT EXISTS idx_lib_series ON library_items(series_title, season, episode);
  CREATE INDEX IF NOT EXISTS idx_lib_server ON library_items(server_id);
  `,
];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  for (; version < MIGRATIONS.length; version++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

/** Opens the DB once and runs pending migrations. Safe to call from anywhere. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      console.log('db urnning');
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}