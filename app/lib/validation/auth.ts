import { z } from 'zod';

export enum AuthField {
  Name = 'name',
  Email = 'email',
  Password = 'password',
}

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters.' })
  .max(60, { message: 'Name must be 60 characters or fewer.' });

const emailSchema = z
  .string()
  .trim()
  .min(5, { message: 'Please enter a valid email address.' })
  .max(255, { message: 'Email must be 255 characters or fewer.' })
  .email({ message: 'Please enter a valid email address.' });

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters.' })
  .max(72, { message: 'Password must be 72 characters or fewer.' })
  .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number.' });

export const signUpSchema = z.object({
  [AuthField.Name]: nameSchema,
  [AuthField.Email]: emailSchema,
  [AuthField.Password]: passwordSchema,
});

export const signInSchema = z.object({
  [AuthField.Email]: emailSchema,
  [AuthField.Password]: z
    .string()
    .min(1, { message: 'Password is required.' }),
});

export type AuthFormData = {
  name?: string;
  email?: string;
};

export type AuthFormErrors = Partial<Record<AuthField, string[]>>;

export type AuthFormState = {
  data?: AuthFormData | null;
  errors?: AuthFormErrors | null;
  message?: string | null;
};

export const emptyAuthState: AuthFormState = {
  data: null,
  errors: null,
  message: null,
};
