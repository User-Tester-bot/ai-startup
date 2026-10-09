'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
// Constants
import { ROUTES } from '@/app/constants';
// UI
import { Button, ButtonColor, UIComponentSize } from '@/app/ui';
// Styles
import styles from './AssistantChat.module.scss';

type ChatRole = 'user' | 'assistant';

export type ChatMessageView = {
  id: string;
  role: ChatRole;
  content: string;
};

type AssistantChatProps = {
  conversationId: string | null;
  initialMessages: ChatMessageView[];
  initialPrompt?: string;
};

const SUGGESTIONS = [
  'Write an SEO content plan for an AI note-taking app',
  'Suggest 5 meta descriptions for a fintech landing page',
  'Build a keyword cluster around “remote team onboarding”',
  'Outline a comparison page: us vs. the competition',
];

export const AssistantChat = ({
  conversationId,
  initialMessages,
  initialPrompt = '',
}: AssistantChatProps) => {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessageView[]>(initialMessages);
  const [input, setInput] = useState(initialPrompt);
  const [activeId, setActiveId] = useState<string | null>(conversationId);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const node = scrollRef.current;

    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  const patchMessage = (
    id: string,
    updater: (message: ChatMessageView) => ChatMessageView,
  ) => {
    setMessages((previous) =>
      previous.map((message) => (message.id === id ? updater(message) : message)),
    );
  };

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();

    if (!text || isStreaming) {
      return;
    }

    setError(null);

    const userMessage: ChatMessageView = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    const assistantId = crypto.randomUUID();

    setMessages((previous) => [
      ...previous,
      userMessage,
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeId, message: text }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`The assistant is unavailable (status ${response.status}).`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const handleEvent = (rawEvent: string) => {
        let event = 'message';
        let data = '';

        for (const line of rawEvent.split('\n')) {
          if (line.startsWith('event:')) {
            event = line.slice('event:'.length).trim();
          } else if (line.startsWith('data:')) {
            data += line.slice('data:'.length).trim();
          }
        }

        if (!data) {
          return;
        }

        if (event === 'meta') {
          const payload = JSON.parse(data) as { conversationId: string };
          setActiveId(payload.conversationId);
          window.history.replaceState(
            null,
            '',
            `${ROUTES.ASSISTANT}?c=${payload.conversationId}`,
          );
        } else if (event === 'delta') {
          const payload = JSON.parse(data) as { text: string };
          patchMessage(assistantId, (message) => ({
            ...message,
            content: message.content + payload.text,
          }));
        } else if (event === 'error') {
          const payload = JSON.parse(data) as { message: string };
          setError(payload.message);
        }
      };

      for (;;) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf('\n\n');

        while (boundary >= 0) {
          handleEvent(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf('\n\n');
        }
      }

      // Drop an empty placeholder if the model produced nothing.
      setMessages((previous) =>
        previous.filter(
          (message) => !(message.id === assistantId && !message.content.trim()),
        ),
      );

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
      setMessages((previous) =>
        previous.filter((message) => message.id !== assistantId),
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.root}>
      <div ref={scrollRef} className={styles.messages}>
        {isEmpty ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>What should we optimize today?</h2>
            <p className={styles.emptyText}>
              Ask for a content plan, titles, meta descriptions, or a keyword
              cluster — the assistant replies instantly.
            </p>

            <ul className={styles.suggestions}>
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className={styles.suggestion}
                    onClick={() => void sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={clsx(styles.message, {
                [styles.user]: message.role === 'user',
                [styles.assistant]: message.role === 'assistant',
              })}
            >
              <div className={styles.bubble}>
                {message.content ? (
                  <p className={styles.text}>{message.content}</p>
                ) : (
                  <span className={styles.typing} aria-label="Assistant is typing">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.composerWrapper}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <form className={styles.composer} onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant… (Enter to send, Shift+Enter for a new line)"
            rows={1}
            disabled={isStreaming}
          />

          <Button
            className={styles.send}
            color={ButtonColor.Purple}
            size={UIComponentSize.Medium}
            type="submit"
            isLoading={isStreaming}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AssistantChat;


