export type ChatRole = 'system' | 'user' | 'assistant';

export type AIMessage = {
  role: ChatRole;
  content: string;
};

export type AIProviderId = 'openai' | 'local';

export type StreamOptions = {
  signal?: AbortSignal;
};
