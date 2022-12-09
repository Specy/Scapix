<script lang="ts">
	import Button from '$cmp/buttons/Button.svelte';
import ElementRow from '$cmp/ElementRow.svelte';
	import GlobalsSelector from '$cmp/GlobalsSelector.svelte';
	import DropZone from '$cmp/misc/DropZone.svelte';
	import { conversionsStore, DenoiseLevel, ImageType, type GlobalSettings } from '$stores/conversionStore';

	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	let globals:GlobalSettings = {
		scale: 2,
		denoise: DenoiseLevel.None,
		imageType: ImageType.Drawing,
	}
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
		<GlobalsSelector  bind:globals/>
		<Button style="width:100%">
			Run all
		</Button>
	</div>
		<div class="elements">
			{#if !$conversionsStore.files.length}
				<div 
					class="no-elements"
					in:fade={{duration: 100, delay: 200}}
				>
					No files selected, go add some!
				</div>
			{/if}
			{#each $conversionsStore.files as el (el.id)}
				<div
					animate:flip={{duration: 200}}
					in:slide|local
					out:fade|local
				>
					<ElementRow 
						element={el} 
						{globals}
						on:delete={() => conversionsStore.remove(el)}
					/>
				</div>
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
		overflow-x: hidden;
		flex-direction: column;
		position: relative;
	}

	.no-elements{
		position: absolute;
		width: 100%;
		top: 0;
		font-size: 1.2rem;
		left: 0;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.globals{
		grid-area: s;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 15rem;
		background-color: var(--secondary);
		border-radius: 0.6rem;
		padding: 0.8rem;
	}
</style>
