import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

/**
 * Opens the on-device pack. Replace with versioned filename once you ship yearly packs.
 */
export function openLiturgicalDatabase(): SQLiteDatabase {
  return openDatabaseSync('liturgical-pack-placeholder.db');
}

/** Call once after opening DB to ensure schema exists (replace with bundled migration). */
export function ensurePlaceholderSchema(db: SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pack_meta (
      id INTEGER PRIMARY KEY,
      jurisdiction_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      version TEXT NOT NULL
    );
  `);
}
