import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Persistence is backed by Node's built-in SQLite driver (`node:sqlite`, Node >= 22.5),
 * which means the app ships with a real, durable database and zero extra dependencies.
 *
 * The database file lives outside of version control (see `.gitignore`) and its location
 * can be overridden with `DATABASE_PATH` for deployments.
 */
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), '.data');
export const DATABASE_PATH =
  process.env.DATABASE_PATH ?? path.join(DATA_DIR, 'app.db');

declare global {
  var __aiStartupDb: DatabaseSync | undefined;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

  CREATE TABLE IF NOT EXISTS conversations (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    title      TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_user_id
    ON conversations (user_id, updated_at DESC);

  CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role            TEXT NOT NULL,
    content         TEXT NOT NULL,
    created_at      INTEGER NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
    ON messages (conversation_id, created_at ASC);
`;

function createDatabase(): DatabaseSync {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  const database = new DatabaseSync(DATABASE_PATH);
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA foreign_keys = ON;');
  database.exec(SCHEMA);

  return database;
}

/**
 * Returns the process-wide SQLite connection. Cached on `globalThis` so Next.js
 * hot-reloads (dev) and repeated module evaluations reuse a single connection.
 */
export function getDb(): DatabaseSync {
  if (!globalThis.__aiStartupDb) {
    globalThis.__aiStartupDb = createDatabase();
  }

  return globalThis.__aiStartupDb;
}
