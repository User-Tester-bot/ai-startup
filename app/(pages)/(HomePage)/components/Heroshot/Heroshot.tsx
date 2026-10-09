import Image from 'next/image';
// UI
import {
  ButtonColor,
  LinkButton,
  UIComponentSize,
} from '@/app/ui';
// Constants
import { ROUTES } from '@/app/constants';
// Images
import HeroshotIllustration from '@/app/(pages)/(HomePage)/components/Heroshot/images/heroshot-illustration.png';
// Styles
import styles from './Heroshot.module.scss';

export const Heroshot = () => {
  return (
    <section className={styles.root}>
      <div>
        <p className={styles.badge}>
          <i className={styles.badgeType}>
            NEW
          </i>
          {' '}
          <span className={styles.badgeLabel}>
          Latest integration just arrived
        </span>
        </p>

        <div className={styles.infoWrapper}>
          <h1 className={styles.infoTitle}>Boost your rankings with AI.</h1>

          <p className={styles.infoDescription}>
            Elevate your site’s visibility effortlessly with AI, where smart
            technology meets user-friendly SEO tools.
          </p>

          <LinkButton
            href={ROUTES.SIGNUP}
            color={ButtonColor.White}
            size={UIComponentSize.Large}
            outerBorder
          >
            Start for free
          </LinkButton>
        </div>
      </div>

      <div className={styles.illustrationWrapper}>
        <div className={styles.illustrationFilterWrapper}>
          <div className={styles.illustrationContainer}>
            <Image
              className={styles.illustration}
              src={HeroshotIllustration}
              alt="Heroshot illustration"
              aria-hidden={true}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Heroshot;
