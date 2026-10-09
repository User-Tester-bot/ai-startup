import type { Metadata } from 'next';
import Link from 'next/link';
// Auth
import { requireUser } from '@/app/lib/auth';
// DB
import { getUserStats, listConversations } from '@/app/lib/db';
// AI
import { getProviderLabel } from '@/app/lib/ai';
// UI
import { ButtonColor, LinkButton, UIComponentSize } from '@/app/ui';
// Constants
import { ROUTES } from '@/app/constants';
// Styles
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Dashboard · AI Startup',
};

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const STARTER_PROMPTS = [
  'SEO content plan for an AI note-taking app',
  'Meta descriptions for a fintech landing page',
  'Keyword cluster around “remote team onboarding”',
];

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = getUserStats(user.id);
  const conversations = listConversations(user.id).slice(0, 5);
  const firstName = user.name.split(' ')[0];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {firstName}</h1>
          <p className={styles.subtitle}>
            Your AI SEO workspace is ready. Generate content plans, titles, and
            keyword clusters in seconds.
          </p>
        </div>

        <LinkButton
          href={ROUTES.ASSISTANT}
          color={ButtonColor.Purple}
          size={UIComponentSize.Medium}
        >
          Open AI Assistant
        </LinkButton>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.conversationCount}</span>
          <span className={styles.statLabel}>Conversations</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.messageCount}</span>
          <span className={styles.statLabel}>Messages generated</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{getProviderLabel()}</span>
          <span className={styles.statLabel}>AI engine</span>
        </div>
      </section>

      <section className={styles.panels}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent conversations</h2>
            <Link className={styles.panelLink} href={ROUTES.ASSISTANT}>
              View all
            </Link>
          </div>

          {conversations.length === 0 ? (
            <p className={styles.empty}>
              No conversations yet. Start your first one with the AI Assistant.
            </p>
          ) : (
            <ul className={styles.list}>
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    className={styles.listItem}
                    href={`${ROUTES.ASSISTANT}?c=${conversation.id}`}
                  >
                    <span className={styles.listTitle}>{conversation.title}</span>
                    <span className={styles.listMeta}>
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Try a starter prompt</h2>
          </div>

          <ul className={styles.prompts}>
            {STARTER_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <Link
                  className={styles.prompt}
                  href={`${ROUTES.ASSISTANT}?q=${encodeURIComponent(prompt)}`}
                >
                  {prompt}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
