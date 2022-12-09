<script>
	import ElementRow from '$cmp/ElementRow.svelte';
	import DropZone from '$cmp/misc/DropZone.svelte';
	import { conversionsStore } from '$stores/conversionStore';
</script>

<div class="page">
	<DropZone
		style="grid-area: d;"
		on:drop={(e) => {
			conversionsStore.add(...e.detail);
		}}
	>
		<div class="dropper">Click to select files or drag and drop files here</div>
		<div slot="hover" class="dropper">Drop files here...</div>
	</DropZone>

	<div class="globals">

	</div>
	<div class="elements">
		{#each $conversionsStore.files as el}
		<ElementRow element={el} />
	{/each}
	</div>

</div>

<style>
	.page {
		display: grid;
		grid-template-areas:
			'd d d d'
			's e e e'
			's e e e';
		;
		grid-template-rows: min-content;
		grid-template-columns: min-content;
		gap: 1rem;
		flex: 1;
		padding: 1rem;
	}
	.dropper {
		display: flex;
		flex: 1;
		font-size: 1.3rem;
		font-weight: bold;
		height: 100%;
		justify-content: center;
		align-items: center;
	}
	.elements {
		grid-area: e;
		display: flex;
		gap: 0.5rem;
		overflow-y: auto;
		flex-direction: column;
	}
	.globals{
		grid-area: s;
		display: flex;
		flex: 1;
		min-width: 15rem;
		background-color: var(--secondary);
		border-radius: 0.6rem;
		padding: 1rem;
	}
</style>
