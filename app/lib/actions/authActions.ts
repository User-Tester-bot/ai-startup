'use server';

import { redirect } from 'next/navigation';
// Auth
import {
  endSession,
  hashPassword,
  startSession,
  verifyPassword,
} from '@/app/lib/auth';
// DB
import { createUser, findUserByEmail, normalizeEmail } from '@/app/lib/db';
// Validation
import {
  AuthField,
  AuthFormState,
  signInSchema,
  signUpSchema,
} from '@/app/lib/validation/auth';

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    [AuthField.Name]: String(formData.get(AuthField.Name) ?? ''),
    [AuthField.Email]: String(formData.get(AuthField.Email) ?? ''),
    [AuthField.Password]: String(formData.get(AuthField.Password) ?? ''),
  };

  const parsed = signUpSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      data: { name: raw.name, email: raw.email },
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please fix the highlighted fields.',
    };
  }

  const { name, email, password } = parsed.data;

  if (findUserByEmail(email)) {
    return {
      data: { name, email },
      errors: { [AuthField.Email]: ['An account with this email already exists.'] },
      message: 'That email is already registered. Try signing in instead.',
    };
  }

  const user = createUser({
    name,
    email,
    passwordHash: await hashPassword(password),
  });

  await startSession(user.id);
  redirect('/dashboard');
}

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    [AuthField.Email]: String(formData.get(AuthField.Email) ?? ''),
    [AuthField.Password]: String(formData.get(AuthField.Password) ?? ''),
  };

  const parsed = signInSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      data: { email: raw.email },
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please fix the highlighted fields.',
    };
  }

  const user = findUserByEmail(parsed.data[AuthField.Email]);

  // Verify against a real hash shape either way to reduce user-enumeration via timing.
  const passwordMatches = user
    ? await verifyPassword(parsed.data[AuthField.Password], user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    return {
      data: { email: normalizeEmail(parsed.data[AuthField.Email]) },
      message: 'Incorrect email or password.',
    };
  }

  await startSession(user.id);
  redirect('/dashboard');
}

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect('/');
}
