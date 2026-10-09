'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
// Actions
import { signOutAction } from '@/app/lib/actions/authActions';
// Constants
import { ROUTES } from '@/app/constants';
// UI
import { Button, ButtonColor, UIComponentSize } from '@/app/ui';
// Images
import LogoImage from '@/app/components/common/Header/logo.png';
// Styles
import styles from './AppSidebar.module.scss';

const NAV_ITEMS = [
  { label: 'Overview', href: ROUTES.DASHBOARD },
  { label: 'AI Assistant', href: ROUTES.ASSISTANT },
];

type AppSidebarProps = {
  userName: string;
  userEmail: string;
};

export const AppSidebar = ({ userName, userEmail }: AppSidebarProps) => {
  const pathname = usePathname();

  const initials = userName
    .split(' ')
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className={styles.root}>
      <Link className={styles.brand} href={ROUTES.HOME}>
        <Image src={LogoImage} alt="AI Startup logo" width={30} height={30} />
        <span className={styles.brandText}>AI Startup</span>
      </Link>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === ROUTES.DASHBOARD
              ? pathname === ROUTES.DASHBOARD
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.navItem, { [styles.active]: isActive })}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.user}>
          <span className={styles.avatar}>{initials || 'AI'}</span>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userEmail}>{userEmail}</span>
          </div>
        </div>

        <form action={signOutAction}>
          <Button
            className={styles.signOut}
            color={ButtonColor.Dark}
            size={UIComponentSize.Small}
            type="submit"
            fullWidth
          >
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
};

export default AppSidebar;
