<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let style = '';
	let input: HTMLInputElement | null = null;
	const dispatch = createEventDispatcher<{ drop: File[] }>();
	let isDragging = false;
</script>

<div
	class="dropzone"
	class:isDragging
	{style}
	on:drop={(e) => {
		e.preventDefault();
		isDragging = false;
		if (!e.dataTransfer) return console.log('no data transfer');
		const files = Array.from(e.dataTransfer.files);
		dispatch('drop', files);
	}}
	on:dragenter={() => (isDragging = true)}
	on:dragleave={() => (isDragging = false)}
	on:dragover={(e) => {
        e.preventDefault()
        isDragging = true
    }}
>
	<input
		type="file"
		bind:this={input}
		accept="image/*, video/*"
		style="display: none;"
		on:change={() => {
			if (!input || !input.files) return;
			const files = Array.from(input.files);
			dispatch('drop', files);
		}}
	/>
	<button on:click={() => input?.click()} class="clicker">
		{#if isDragging}
			<slot name="hover" />
		{:else}
			<slot />
		{/if}
	</button>
</div>

<style lang="scss">
	.clicker {
		display: flex;
		flex: 1;
		cursor: pointer;
		padding: 1rem;
		background: none;
        color: var(--primary-text);
		border: none;
	}

	.dropzone {
		display: flex;
		height: 10rem;
		flex: 1;
		border-radius: 1rem;
		border: dashed 4px var(--accent2);
		overflow: hidden;
		background-color: var(--primary);
		transition: all 0.2s;
	}
	.isDragging {
		background-color: var(--accent2);
		color: var(--accent2-text);
	}
</style>
