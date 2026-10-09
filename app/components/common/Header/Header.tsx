'use client';

import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
// Constants
import { ROUTES } from '@/app/constants';
// Ui
import { ButtonColor, LinkButton, UIComponentSize } from '@/app/ui';
// Images
import LogoImage from '@/app/components/common/Header/logo.png';
// Components
import {
  MobileMenu,
  DesktopMenu,
} from '@/app/components/common/Header/components';
import { NavItem } from '@/app/components/common/Header/types';
// Styles
import styles from './Header.module.scss';

const navItems: NavItem[] = [
  {
    label: 'Features',
    subItems: [
      {
        label: 'OneClick',
        href: ROUTES.ONECLICK,
      },
      {
        label: 'Lifestyle Data',
        href: ROUTES.LIFESTYLE_DATA,
      },
      {
        label: 'Location Data',
        href: ROUTES.LOCATION_DATA,
      },
    ],
  },
  {
    label: 'Developers',
    href: ROUTES.DEVELOPERS,
  },
  {
    label: 'Company',
    subItems: [
      {
        label: 'About',
        href: ROUTES.ABOUT,
      },
      {
        label: 'Careers',
        href: ROUTES.CAREERS,
      },
      {
        label: 'Contact',
        href: ROUTES.CONTACT,
      },
    ],
  },
  {
    label: 'Blog',
    href: ROUTES.BLOG,
  },
  {
    label: 'Changelog',
    href: ROUTES.CHANGELOG,
  },
];

type HeaderProps = {
  className?: string;
  isAuthenticated?: boolean;
};

export const Header = ({ className, isAuthenticated = false }: HeaderProps) => {

  return (
    <header className={clsx(styles.root, className)}>
      <div className={styles.wrapper}>
        <Link
          className={styles.logoWrapper}
          href={ROUTES.HOME}
          title="Go Home"
          aria-label="Home link"
        >
          <Image
            className={styles.logo}
            src={LogoImage}
            alt="AI startup logo"
            width={38}
            height={38}
            loading="lazy"
          />
        </Link>

        <DesktopMenu items={navItems}/>

        <div className={styles.rightMenuWrapper}>
          {isAuthenticated ? (
            <LinkButton
              href={ROUTES.DASHBOARD}
              size={UIComponentSize.Small}
              color={ButtonColor.Purple}
              outerBorderBold
            >
              Dashboard
            </LinkButton>
          ) : (
            <>
              <Link className={styles.signInLink} href={ROUTES.LOGIN}>
                Sign in
              </Link>

              <LinkButton
                href={ROUTES.SIGNUP}
                size={UIComponentSize.Small}
                color={ButtonColor.Purple}
                outerBorderBold
              >
                Get started
              </LinkButton>
            </>
          )}

          <MobileMenu items={navItems}/>
        </div>
      </div>
    </header>
  );
};

export default Header;
