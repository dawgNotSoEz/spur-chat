import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMessages } from '$lib/server/repository';

export const GET: RequestHandler = async ({ url }) => {
	const sessionId = url.searchParams.get('sessionId');

	if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
		return json({ error: 'Missing or invalid sessionId' }, { status: 400 });
	}

	try {
		const messages = getMessages(sessionId);
		return json({ messages, sessionId });
	} catch (err) {
		console.error('Failed to fetch history:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};