'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
// Actions
import { signInAction, signUpAction } from '@/app/lib/actions/authActions';
// Validation
import { AuthField, emptyAuthState } from '@/app/lib/validation/auth';
// UI
import { Button, ButtonColor, UIComponentSize } from '@/app/ui';
// Constants
import { ROUTES } from '@/app/constants';
// Styles
import styles from './AuthForm.module.scss';

export type AuthFormMode = 'signin' | 'signup';

const COPY: Record<AuthFormMode, {
  title: string;
  subtitle: string;
  submit: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
}> = {
  signin: {
    title: 'Welcome back',
    subtitle: 'Sign in to your AI Startup workspace.',
    submit: 'Sign in',
    footerText: 'New here?',
    footerLinkLabel: 'Create an account',
    footerLinkHref: ROUTES.SIGNUP,
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Start generating SEO assets with AI in seconds.',
    submit: 'Create account',
    footerText: 'Already have an account?',
    footerLinkLabel: 'Sign in',
    footerLinkHref: ROUTES.LOGIN,
  },
};

type AuthFormProps = {
  mode: AuthFormMode;
};

export const AuthForm = ({ mode }: AuthFormProps) => {
  const copy = COPY[mode];
  const action = mode === 'signup' ? signUpAction : signInAction;

  const [state, formAction, isPending] = useActionState(action, emptyAuthState);

  const errors = state.errors
    ? Object.values(state.errors).flat().filter(Boolean)
    : [];

  const fieldError = (field: AuthField): string | undefined =>
    state.errors?.[field]?.[0];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>
      </header>

      <form className={styles.form} action={formAction} noValidate>
        {mode === 'signup' && (
          <label className={styles.field}>
            <span className={styles.label}>Name</span>
            <input
              className={clsx(styles.input, { [styles.inputError]: fieldError(AuthField.Name) })}
              name={AuthField.Name}
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              defaultValue={state.data?.name}
            />
            {fieldError(AuthField.Name) && (
              <span className={styles.fieldError}>{fieldError(AuthField.Name)}</span>
            )}
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            className={clsx(styles.input, { [styles.inputError]: fieldError(AuthField.Email) })}
            name={AuthField.Email}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            defaultValue={state.data?.email}
          />
          {fieldError(AuthField.Email) && (
            <span className={styles.fieldError}>{fieldError(AuthField.Email)}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            className={clsx(styles.input, { [styles.inputError]: fieldError(AuthField.Password) })}
            name={AuthField.Password}
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
          />
          {fieldError(AuthField.Password) && (
            <span className={styles.fieldError}>{fieldError(AuthField.Password)}</span>
          )}
        </label>

        {errors.length > 0 && state.message && (
          <p className={styles.message} role="alert">{state.message}</p>
        )}

        <Button
          className={styles.submit}
          color={ButtonColor.Purple}
          size={UIComponentSize.Large}
          fullWidth
          type="submit"
          isLoading={isPending}
        >
          {copy.submit}
        </Button>
      </form>

      <p className={styles.footer}>
        {copy.footerText}{' '}
        <Link className={styles.footerLink} href={copy.footerLinkHref}>
          {copy.footerLinkLabel}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
