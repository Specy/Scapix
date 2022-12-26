<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let style = '';
	let input: HTMLInputElement | null = null;
	const dispatch = createEventDispatcher<{ drop: File[] }>();
	let isDragging = false;
	export let formats: string[] = []
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
		e.preventDefault();
		isDragging = true;
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
	{#if formats.length > 0}
		<div class="formats">
			{#each formats as format}
				<span class="format">{format}</span>
			{/each}
		</div>
	{/if}
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
	.formats{
		position: absolute;
		bottom: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 0.7;
		padding: 0.4rem 0.6rem;
		gap: 0.5rem;
		font-size: 0.6rem;
		color: var(--primary-text);
	}
	.dropzone {
		display: flex;
		position: relative;
		height: 10rem;
		flex: 1;
		box-shadow: inset 0 0 1.5rem 1rem var(--secondary);
		border-radius: 0.6rem;
		overflow: hidden;
		background-color: var(--primary);
		transition: all 0.4s;
		border: dashed 0.2rem var(--tertiary);
	}
	.isDragging {
		background-color: var(--accent2);
	}
</style>
