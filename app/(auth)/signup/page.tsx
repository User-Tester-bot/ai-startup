import type { Metadata } from 'next';
// Components
import { AuthForm } from '@/app/(auth)/components';

export const metadata: Metadata = {
  title: 'Create account · AI Startup',
};

export default function SignUpPage() {
  return <AuthForm mode="signup" />;
}
