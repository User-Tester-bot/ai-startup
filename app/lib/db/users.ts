import { randomUUID } from 'node:crypto';
import { getDb } from './client';

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
};

export type PublicUser = Omit<User, 'passwordHash'>;

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: number;
};

const mapRow = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  passwordHash: row.password_hash,
  createdAt: row.created_at,
});

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
});

export function findUserById(id: string): User | null {
  const row = getDb()
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(id) as unknown as UserRow | undefined;

  return row ? mapRow(row) : null;
}

export function findUserByEmail(email: string): User | null {
  const row = getDb()
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(normalizeEmail(email)) as unknown as UserRow | undefined;

  return row ? mapRow(row) : null;
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): User {
  const user: User = {
    id: randomUUID(),
    email: normalizeEmail(input.email),
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    createdAt: Date.now(),
  };

  getDb()
    .prepare(
      `INSERT INTO users (id, email, name, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.createdAt,
    );

  return user;
}
