import { randomUUID } from 'node:crypto';
import { getDb } from './client';

export type ChatRole = 'user' | 'assistant';

export type Conversation = {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

type ConversationRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: number;
  updated_at: number;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  created_at: number;
};

const mapConversation = (row: ConversationRow): Conversation => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapMessage = (row: MessageRow): ChatMessage => ({
  id: row.id,
  conversationId: row.conversation_id,
  role: row.role,
  content: row.content,
  createdAt: row.created_at,
});

export function listConversations(userId: string): Conversation[] {
  const rows = getDb()
    .prepare(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
    )
    .all(userId) as unknown as ConversationRow[];

  return rows.map(mapConversation);
}

export function getConversation(
  id: string,
  userId: string,
): Conversation | null {
  const row = getDb()
    .prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?')
    .get(id, userId) as unknown as ConversationRow | undefined;

  return row ? mapConversation(row) : null;
}

export function createConversation(
  userId: string,
  title = 'New conversation',
): Conversation {
  const now = Date.now();

  const conversation: Conversation = {
    id: randomUUID(),
    userId,
    title: title.slice(0, 120),
    createdAt: now,
    updatedAt: now,
  };

  getDb()
    .prepare(
      `INSERT INTO conversations (id, user_id, title, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      conversation.id,
      conversation.userId,
      conversation.title,
      conversation.createdAt,
      conversation.updatedAt,
    );

  return conversation;
}

export function renameConversation(id: string, title: string): void {
  getDb()
    .prepare('UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?')
    .run(title.slice(0, 120), Date.now(), id);
}

export function touchConversation(id: string): void {
  getDb()
    .prepare('UPDATE conversations SET updated_at = ? WHERE id = ?')
    .run(Date.now(), id);
}

export function deleteConversation(id: string, userId: string): void {
  getDb()
    .prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?')
    .run(id, userId);
}

export function listMessages(conversationId: string): ChatMessage[] {
  const rows = getDb()
    .prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    )
    .all(conversationId) as unknown as MessageRow[];

  return rows.map(mapMessage);
}

export function appendMessage(
  conversationId: string,
  role: ChatRole,
  content: string,
): ChatMessage {
  const message: ChatMessage = {
    id: randomUUID(),
    conversationId,
    role,
    content,
    createdAt: Date.now(),
  };

  getDb()
    .prepare(
      `INSERT INTO messages (id, conversation_id, role, content, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      message.id,
      message.conversationId,
      message.role,
      message.content,
      message.createdAt,
    );

  touchConversation(conversationId);

  return message;
}

export type UserStats = {
  conversationCount: number;
  messageCount: number;
};

export function getUserStats(userId: string): UserStats {
  const conversationCount = getDb()
    .prepare('SELECT COUNT(*) AS count FROM conversations WHERE user_id = ?')
    .get(userId) as unknown as { count: number };

  const messageCount = getDb()
    .prepare(
      `SELECT COUNT(*) AS count
         FROM messages
        WHERE conversation_id IN (
          SELECT id FROM conversations WHERE user_id = ?
        )`,
    )
    .get(userId) as unknown as { count: number };

  return {
    conversationCount: Number(conversationCount?.count ?? 0),
    messageCount: Number(messageCount?.count ?? 0),
  };
}
