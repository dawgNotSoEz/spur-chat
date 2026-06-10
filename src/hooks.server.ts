import { initDb } from '$lib/server/db';

/** Called once when the server starts */
export async function init() {
	console.log('🚀 Spur Chat – starting server...');
	initDb();
}