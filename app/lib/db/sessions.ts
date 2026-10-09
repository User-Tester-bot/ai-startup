import { randomUUID } from 'node:crypto';
import { getDb } from './client';

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export type Session = {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
};

type SessionRow = {
  id: string;
  user_id: string;
  created_at: number;
  expires_at: number;
};

const mapRow = (row: SessionRow): Session => ({
  id: row.id,
  userId: row.user_id,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
});

export function createSession(userId: string, ttlMs = SESSION_TTL_MS): Session {
  const now = Date.now();

  const session: Session = {
    id: randomUUID(),
    userId,
    createdAt: now,
    expiresAt: now + ttlMs,
  };

  getDb()
    .prepare(
      `INSERT INTO sessions (id, user_id, created_at, expires_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(session.id, session.userId, session.createdAt, session.expiresAt);

  return session;
}

/** Returns the session only when it exists and has not expired. */
export function findValidSession(id: string): Session | null {
  const row = getDb()
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(id) as unknown as SessionRow | undefined;

  if (!row) {
    return null;
  }

  const session = mapRow(row);

  if (session.expiresAt <= Date.now()) {
    deleteSession(session.id);
    return null;
  }

  return session;
}

export function deleteSession(id: string): void {
  getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function deleteUserSessions(userId: string): void {
  getDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

/** Housekeeping: drop expired rows. Cheap enough to run opportunistically. */
export function purgeExpiredSessions(): void {
  getDb().prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
}
