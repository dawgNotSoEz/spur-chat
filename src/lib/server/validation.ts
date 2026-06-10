const MAX_MESSAGE_LENGTH = 2000;

/**
 * Returns an error string if the message is invalid, or null if it’s OK.
 */
export function validateMessage(body: unknown): string | null {
	if (!body || typeof body !== 'object') {
		return 'Invalid request body';
	}
	const { message } = body as Record<string, unknown>;
	if (typeof message !== 'string' || message.trim().length === 0) {
		return 'Message cannot be empty.';
	}
	if (message.length > MAX_MESSAGE_LENGTH) {
		return `Message too long. Please shorten your message to ${MAX_MESSAGE_LENGTH} characters.`;
	}
	return null;
}