import type { NextRequest } from 'next/server';
import { z } from 'zod';
// Auth
import { getCurrentUser } from '@/app/lib/auth';
// DB
import {
  appendMessage,
  createConversation,
  getConversation,
  listMessages,
} from '@/app/lib/db';
// AI
import { streamAssistantReply } from '@/app/lib/ai';
import type { AIMessage } from '@/app/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HISTORY_LIMIT = 20;

const bodySchema = z.object({
  conversationId: z.string().uuid().nullish(),
  message: z
    .string()
    .trim()
    .min(1, { message: 'Message is required.' })
    .max(2000, { message: 'Message is too long.' }),
});

const sse = (event: string, data: unknown): string =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { message } = parsed.data;

  let conversationId = parsed.data.conversationId ?? null;

  if (conversationId) {
    if (!getConversation(conversationId, user.id)) {
      return json({ error: 'Conversation not found.' }, 404);
    }
  } else {
    conversationId = createConversation(user.id, message).id;
  }

  const activeConversationId = conversationId;

  appendMessage(activeConversationId, 'user', message);

  const history = listMessages(activeConversationId)
    .slice(-HISTORY_LIMIT)
    .map((entry) => ({ role: entry.role, content: entry.content })) as AIMessage[];

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        encoder.encode(sse('meta', { conversationId: activeConversationId })),
      );

      let full = '';

      try {
        for await (const delta of streamAssistantReply(history)) {
          full += delta;
          controller.enqueue(encoder.encode(sse('delta', { text: delta })));
        }

        if (full.trim()) {
          appendMessage(activeConversationId, 'assistant', full);
        }

        controller.enqueue(encoder.encode(sse('done', { ok: true })));
      } catch (error) {
        console.error('[api/chat] assistant failed:', error);
        controller.enqueue(
          encoder.encode(
            sse('error', { message: 'The assistant failed to respond. Please try again.' }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
