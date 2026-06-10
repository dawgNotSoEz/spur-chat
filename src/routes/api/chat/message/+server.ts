import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateMessage } from '$lib/server/validation';
import { createConversation, saveMessage, getMessages } from '$lib/server/repository';
import { buildMessages } from '$lib/server/prompt';
import { generateReply, LLMError } from '$lib/server/llm';

export const POST: RequestHandler = async ({ request }) => {
	// ---- 1. Parse & Validate ----
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const validationError = validateMessage(body);
	if (validationError) {
		return json({ error: validationError }, { status: 400 });
	}

	const { message, sessionId } = body as { message: string; sessionId?: string };

	// ---- 2. Create or reuse conversation ----
	const convId: string = sessionId && typeof sessionId === 'string'
		? sessionId
		: createConversation();

	// ---- 3. Save the user message ----
	try {
		saveMessage(convId, 'user', message);
	} catch (err) {
		console.error('Failed to save user message:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}

	// ---- 4. Fetch recent history for context ----
	let pastMessages;
	try {
		pastMessages = getMessages(convId, 10); // last 10 messages
	} catch (err) {
		console.error('Failed to fetch history:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}

	// ---- 5. Call LLM (with graceful fallback) ----
	let reply: string;
	try {
		const messages = buildMessages(message, pastMessages);
		reply = await generateReply(messages);
	} catch (err) {
		// Log the real error, but return a friendly message to the user
		console.error('LLM error:', err);
		reply = "I'm having trouble answering right now. Please try again in a moment. If the problem persists, email us at support@shopspur.com.";
	}

	// ---- 6. Save AI reply ----
	try {
		saveMessage(convId, 'ai', reply);
	} catch (err) {
		console.error('Failed to save AI reply:', err);
		// Non‑fatal – reply already available, just log
	}

	// ---- 7. Return to client ----
	return json({ reply, sessionId: convId });
};