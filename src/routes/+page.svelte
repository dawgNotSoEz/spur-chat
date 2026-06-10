<script lang="ts">
	import ChatWidget from '$lib/components/ChatWidget.svelte';
</script>

<svelte:head>
	<title>ShopSpur Support Chat</title>
</svelte:head>

<div class="page">
	<ChatWidget />
</div>

<style>
	.page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #f2f2f7;
	}
</style>