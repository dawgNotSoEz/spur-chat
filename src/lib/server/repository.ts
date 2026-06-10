import { db } from './db';
import type { Message } from '$lib/types';

/**
 * Create a new conversation and return its id.
 */
export function createConversation(): string {
	const id = crypto.randomUUID();
	const stmt = db.prepare('INSERT INTO conversations (id) VALUES (?)');
	stmt.run(id);
	return id;
}

/**
 * Save a message and return the full row.
 */
export function saveMessage(
	conversationId: string,
	sender: 'user' | 'ai',
	text: string
): Message {
	const stmt = db.prepare(
		'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?) RETURNING *'
	);
	// better-sqlite3 returns the row as a plain object when using .get() with RETURNING
	const row = stmt.get(conversationId, sender, text) as any;
	return row as Message;
}

/**
 * Fetch last `limit` messages of a conversation, ordered by creation time.
 */
export function getMessages(conversationId: string, limit = 20): Message[] {
	const stmt = db.prepare(
		'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?'
	);
	return stmt.all(conversationId, limit) as Message[];
}