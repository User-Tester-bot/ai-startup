import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SCHEME = 'scrypt';

/**
 * Hash a plaintext password with a random per-user salt.
 * Format: `scrypt:<salt-hex>:<derived-key-hex>`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, KEY_LENGTH);

  return `${SCHEME}:${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [scheme, salt, hash] = storedHash.split(':');

  if (scheme !== SCHEME || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, 'hex');

  if (expected.length !== KEY_LENGTH) {
    return false;
  }

  const derived = await scrypt(password, salt, KEY_LENGTH);

  // Constant-time comparison to avoid leaking information via timing.
  return timingSafeEqual(derived, expected);
}
