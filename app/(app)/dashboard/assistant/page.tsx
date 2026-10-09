import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
// Auth
import { requireUser } from '@/app/lib/auth';
// DB
import { getConversation, listConversations, listMessages } from '@/app/lib/db';
// AI
import { getProviderLabel } from '@/app/lib/ai';
// Constants
import { ROUTES } from '@/app/constants';
// Components
import { AssistantChat } from './components';
// Styles
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'AI Assistant · AI Startup',
};

type AssistantPageProps = {
  searchParams: Promise<{ c?: string; q?: string }>;
};

export default async function AssistantPage({ searchParams }: AssistantPageProps) {
  const user = await requireUser();
  const { c, q } = await searchParams;

  const conversations = listConversations(user.id);
  const active = c ? getConversation(c, user.id) : null;
  const messages = active ? listMessages(active.id) : [];

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <Link className={styles.newChat} href={ROUTES.ASSISTANT}>
          + New chat
        </Link>

        <span className={styles.sidebarLabel}>History</span>

        {conversations.length === 0 ? (
          <p className={styles.sidebarEmpty}>No conversations yet.</p>
        ) : (
          <ul className={styles.convList}>
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  className={clsx(styles.convItem, {
                    [styles.convItemActive]: active?.id === conversation.id,
                  })}
                  href={`${ROUTES.ASSISTANT}?c=${conversation.id}`}
                >
                  {conversation.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>AI Assistant</h1>
          <p className={styles.provider}>{getProviderLabel()}</p>
        </header>

        <AssistantChat
          conversationId={active?.id ?? null}
          initialMessages={messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
          }))}
          initialPrompt={q ?? ''}
        />
      </section>
    </div>
  );
}
