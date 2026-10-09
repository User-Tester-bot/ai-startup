import type { ReactNode } from 'react';
// Components
import { Footer, Header } from '@/app/components/common';
// Auth
import { getCurrentUser } from '@/app/lib/auth';
// Styles
import styles from './layout.module.scss';

export default async function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <div className={styles.root}>
      <Header className={styles.header} isAuthenticated={Boolean(user)} />

      <main className={styles.content}>{children}</main>

      <Footer className={styles.footer} />
    </div>
  );
}
