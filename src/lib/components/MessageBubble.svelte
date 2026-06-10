<script lang="ts">
	let { sender, text }: { sender: 'user' | 'ai'; text: string } = $props();
</script>

<div class="bubble {sender === 'user' ? 'user' : 'ai'}">
	<span class="label">{sender === 'user' ? 'You' : 'Agent'}</span>
	<p class="text">{text}</p>
</div>
<style>
	.bubble {
		max-width: 80%;
		margin: 0.5rem 0;
		padding: 0.75rem 1rem;
		border-radius: 1rem;
		line-height: 1.5;
		word-break: break-word;
	}
	.user {
		align-self: flex-end;
		background: #007aff;
		color: white;
		border-bottom-right-radius: 0.25rem;
	}
	.ai {
		align-self: flex-start;
		background: #e9e9eb;
		color: #1c1c1e;
		border-bottom-left-radius: 0.25rem;
	}
	.label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		opacity: 0.8;
	}
	.text {
		margin: 0;
		white-space: pre-wrap;
	}
</style>