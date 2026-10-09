import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
// UI
import { ButtonColor } from '@/app/ui/Button/Button';
import { UIComponentSize } from '@/app/ui/types';
// Styles
import styles from '@/app/ui/Button/Button.module.scss';

export type LinkButtonProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  'href'
> & {
  href: string;
  color?: ButtonColor;
  size?: UIComponentSize;
  fullWidth?: boolean;
  outerBorder?: boolean;
  outerBorderBold?: boolean;
  disabled?: boolean;
};

/** A `next/link` that reuses the `Button` visual language for navigation CTAs. */
export const LinkButton = ({
  href,
  color = ButtonColor.Dark,
  size = UIComponentSize.Medium,
  fullWidth,
  outerBorder,
  outerBorderBold,
  disabled,
  className,
  children,
  ...rest
}: LinkButtonProps) => {
  return (
    <Link
      href={href}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={clsx(
        styles.root,
        styles[color],
        styles[size],
        {
          [styles.fullWidth]: fullWidth,
          [styles.outerBorder]: outerBorder,
          [styles.outerBorderBold]: outerBorderBold,
        },
        className,
      )}
      {...rest}
    >
      <span className={styles.content}>{children}</span>
    </Link>
  );
};

export default LinkButton;
