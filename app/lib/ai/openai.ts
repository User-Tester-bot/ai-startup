import type { AIMessage, StreamOptions } from './types';
import { SYSTEM_PROMPT } from './localEngine';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';

export function getApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY;
}

export function getBaseUrl(): string {
  return (process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL)
    .replace(/\/$/, '');
}

export function getModel(): string {
  return process.env.AI_MODEL ?? DEFAULT_MODEL;
}

export function isOpenAIConfigured(): boolean {
  return Boolean(getApiKey());
}

type OpenAIDelta = {
  choices?: Array<{ delta?: { content?: string } }>;
};

/**
 * Streams a chat completion from any OpenAI-compatible endpoint
 * (`/chat/completions` with `stream: true`), yielding content deltas.
 */
export async function* streamOpenAIReply(
  messages: AIMessage[],
  options: StreamOptions = {},
): AsyncGenerator<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('No AI API key configured.');
  }

  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
    }),
    signal: options.signal,
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `AI provider responded with ${response.status}. ${detail.slice(0, 300)}`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    // Keep the last (possibly partial) line in the buffer.
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith('data:')) {
        continue;
      }

      const payload = trimmed.slice('data:'.length).trim();

      if (payload === '[DONE]') {
        return;
      }

      try {
        const parsed = JSON.parse(payload) as OpenAIDelta;
        const delta = parsed.choices?.[0]?.delta?.content;

        if (delta) {
          yield delta;
        }
      } catch {
        // Ignore malformed keep-alive frames.
      }
    }
  }
}
