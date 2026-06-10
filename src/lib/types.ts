export interface Message {
	id: number;
	conversation_id: string;
	sender: 'user' | 'ai';
	text: string;
	created_at: string;
}

export interface Conversation {
	id: string;
	created_at: string;
}