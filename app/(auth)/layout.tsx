import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Constants
import { ROUTES } from '@/app/constants';
// Images
import LogoImage from '@/app/components/common/Header/logo.png';
// Styles
import styles from './layout.module.scss';

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles.root}>
      <div className={styles.glow} aria-hidden="true" />

      <Link className={styles.logoWrapper} href={ROUTES.HOME} aria-label="Back to home">
        <Image src={LogoImage} alt="AI Startup logo" width={44} height={44} />
        <span className={styles.logoText}>AI Startup</span>
      </Link>

      {children}
    </div>
  );
}
