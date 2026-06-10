// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module '$env/dynamic/private' {
	export const env: {
		OPENAI_API_KEY: string;
		DATABASE_PATH?: string; // optional, we'll default in code
	};
}

export {};