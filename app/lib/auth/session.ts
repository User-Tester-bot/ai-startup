import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// DB
import {
  createSession,
  deleteSession,
  findUserById,
  findValidSession,
  User,
} from '@/app/lib/db';

export const SESSION_COOKIE = 'ai_startup_session';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/** Creates a DB-backed session and attaches the session cookie to the response. */
export async function startSession(userId: string): Promise<void> {
  const session = createSession(userId);
  const store = await cookies();

  store.set(SESSION_COOKIE, session.id, {
    ...COOKIE_OPTIONS,
    expires: new Date(session.expiresAt),
  });
}

/** Destroys the current session (DB row + cookie). */
export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    deleteSession(token);
  }

  store.set(SESSION_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}

/**
 * Resolves the authenticated user for the current request, or `null`.
 * Wrapped in `cache` so multiple calls within one request hit the DB once.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = findValidSession(token);

  if (!session) {
    return null;
  }

  return findUserById(session.userId);
});

/** Like `getCurrentUser`, but redirects to the login page when unauthenticated. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}
