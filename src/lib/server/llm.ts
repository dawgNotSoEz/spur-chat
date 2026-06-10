import { env } from '$env/dynamic/private';

const TIMEOUT_MS = 15_000; // 15 seconds
const MAX_TOKENS = 500; // cost safety cap

// ---------- Custom error classes ----------

export class LLMError extends Error {
	constructor(
		message: string,
		public statusCode?: number
	) {
		super(message);
		this.name = 'LLMError';
	}
}

export class LLMTimeoutError extends LLMError {
	constructor(message = 'LLM request timed out') {
		super(message);
		this.name = 'LLMTimeoutError';
	}
}

export class LLMAuthError extends LLMError {
	constructor(message = 'Invalid or missing API key') {
		super(message, 401);
		this.name = 'LLMAuthError';
	}
}

export class LLMRateLimitError extends LLMError {
	constructor(message = 'Rate limited by LLM provider') {
		super(message, 429);
		this.name = 'LLMRateLimitError';
	}
}

export class LLMNetworkError extends LLMError {
	constructor(message = 'Network error contacting LLM') {
		super(message);
		this.name = 'LLMNetworkError';
	}
}

// ---------- Core function ----------

/**
 * Sends messages to OpenAI and returns the assistant’s reply.
 * Throws one of the LLMError subclasses on failure.
 */
export async function generateReply(
	messages: Array<{ role: string; content: string }>
): Promise<string> {
	const apiKey = env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new LLMAuthError('Missing OPENAI_API_KEY environment variable');
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

	try {
		const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: 'llama-3.3-70b-versatile', // fast, cheap, perfect for support
				messages,
				max_tokens: MAX_TOKENS,
				temperature: 0.3 // factual, consistent answers
			}),
			signal: controller.signal
		});

		clearTimeout(timeout);

		if (!res.ok) {
			if (res.status === 401) throw new LLMAuthError();
			if (res.status === 429) throw new LLMRateLimitError();
			throw new LLMError(
				`OpenAI API error: ${res.status} ${res.statusText}`,
				res.status
			);
		}

		const data = await res.json();
		const reply = data.choices?.[0]?.message?.content;

		if (!reply || typeof reply !== 'string') {
			throw new LLMError('Empty or invalid response from LLM');
		}

		return reply.trim();
	} catch (err) {
		clearTimeout(timeout);

		// Re‑throw our custom errors as‑is
		if (err instanceof LLMError) throw err;

		// Handle AbortError (timeout) – works in all Node versions
		if (err instanceof Error && err.name === 'AbortError') {
			throw new LLMTimeoutError();
		}

		// Any other network / unexpected error
		throw new LLMNetworkError(
			err instanceof Error ? err.message : undefined
		);
	}
}