import type { Metadata } from 'next';
// Components
import { AuthForm } from '@/app/(auth)/components';

export const metadata: Metadata = {
  title: 'Sign in · AI Startup',
};

export default function LoginPage() {
  return <AuthForm mode="signin" />;
}
