import type { ReactNode } from 'react';
// Auth
import { requireUser } from '@/app/lib/auth';
// Components
import { AppSidebar } from '@/app/(app)/components';
// Styles
import styles from './layout.module.scss';

export default async function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await requireUser();

  return (
    <div className={styles.root}>
      <AppSidebar userName={user.name} userEmail={user.email} />

      <main className={styles.content}>{children}</main>
    </div>
  );
}
