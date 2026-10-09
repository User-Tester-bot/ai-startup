import type { AIMessage, AIProviderId, StreamOptions } from './types';
import { streamLocalReply } from './localEngine';
import { isOpenAIConfigured, getModel, streamOpenAIReply } from './openai';

export * from './types';
export { SYSTEM_PROMPT, extractSubject } from './localEngine';

export function getProviderId(): AIProviderId {
  return isOpenAIConfigured() ? 'openai' : 'local';
}

export function getProviderLabel(): string {
  return getProviderId() === 'openai'
    ? `Live model · ${getModel()}`
    : 'Built-in engine · Aria';
}

/**
 * Streams an assistant reply using the configured provider, falling back to the
 * built-in engine if the live provider is unavailable or errors out.
 */
export async function* streamAssistantReply(
  messages: AIMessage[],
  options: StreamOptions = {},
): AsyncGenerator<string> {
  if (isOpenAIConfigured()) {
    let emitted = false;

    try {
      for await (const delta of streamOpenAIReply(messages, options)) {
        emitted = true;
        yield delta;
      }

      return;
    } catch (error) {
      // If we already streamed some content we cannot cleanly retry — surface it.
      if (emitted) {
        throw error;
      }

      console.error('[ai] Live provider failed, falling back to local engine:', error);
    }
  }

  yield* streamLocalReply(messages, options);
}
