<script lang="ts">
	import Button from '$cmp/buttons/Button.svelte';
	import GlobalsSelector from '$cmp/GlobalsSelector.svelte';
	import DropZone from '$cmp/misc/DropZone.svelte';
	import { conversionsStore, type ConversionDiff } from '$stores/conversionStore';
	import { Status, Upscaler, type GlobalSettings } from '$common/types/Files';
	import { DenoiseLevel } from '$common/types/Files';
	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { settingsStore } from '$stores/settingsStore';
	import ResultPreviewer from '$cmp/ResultPreviewer.svelte';
	import ElementRow from '$cmp/ElementRow.svelte';
	import FaPlay from 'svelte-icons/fa/FaPlay.svelte';
	import Icon from '$cmp/layout/Icon.svelte';
	import FaStop from 'svelte-icons/fa/FaStop.svelte';
	import InfiniteScroll from "svelte-infinite-scroll"; 
	let floatingResult: ConversionDiff | undefined;
	let isProcessing = false;
	let showingOriginal = false;
	$: isProcessing = $conversionsStore.files.some(el => el.status.status === Status.Converting)
	const perPage = 5;
	let page = 1;
	$: {
		if(page * perPage > $conversionsStore.files.length){
			page = Math.max(Math.ceil($conversionsStore.files.length / perPage), 1)
		}
	}
	onMount(() => {
		async function syncModels(){
			const models = await window.api.getWaifuModels()
			settingsStore.setModels(models)
		}
		syncModels()
		function onKeyDown(e: KeyboardEvent){
			const code = e.code;
			if(code === "Escape"){
				floatingResult = undefined;
			}
			if((code === "ArrowDown" || code === "ArrowUp") && floatingResult){
				const next = conversionsStore.getNextValid(floatingResult?.original, code === "ArrowDown" ? "next" : "previous")
				if(next && next.status.status === Status.Done){
					floatingResult = {
						original: next,
						converted: next.status.resultPath
					}
				}
			}
			if((code === "ArrowLeft" || code === "ArrowRight") && floatingResult){
				showingOriginal = !showingOriginal;
			}
		}

		window.addEventListener("keydown", onKeyDown)
		return () => {
			window.removeEventListener("keydown", onKeyDown)
		}
	})
</script>
<script context="module" lang="ts">
    import { writable } from "svelte/store";
    export const globals = writable<GlobalSettings>({
		scale: 2,
		denoise: DenoiseLevel.None,
		waifu2xModel: "drawing",
		upscaler: Upscaler.Waifu2x
	})
</script>

<div class="page">
	<ResultPreviewer 
		bind:showingOriginal
		diff={floatingResult}
		on:close={() => {
			floatingResult = undefined;
		}}
	/>
	<DropZone
		style="grid-area: d;"
		formats={["Images", "Videos", "Gifs", "Webp"]}
		on:drop={(e) => {
			conversionsStore.add(...e.detail);
		}}
	>
		<div class="dropper">
			<div>
				Drag and drop files here
			</div>
			<Button cssVar="tertiary">
				Or select files
			</Button>
		</div>
		<div slot="hover" class="dropper">Drop files here...</div>
	</DropZone>

	<div class="globals">
		<GlobalsSelector  
			bind:globals={$globals}
		/>
		<Button
			style="width:100%; margin-top: 0.4rem"
			cssVar="tertiary"
			on:click={() => {
				window.api.openDir($settingsStore.outputDirectory.value)
			}}
		>
			Open results folder
		</Button>
		<Button 
			style="width:100%; align-items: center; position: relative; margin-top: 0.4rem"
			cssVar={isProcessing ? "red" : "accent"}
			on:click={() => {
				if(isProcessing){
					window.api.haltAll()
				}else{
					window.api.executeFiles(
						$conversionsStore.files.map(el => el.serialize()), 
						$globals, 
						settingsStore.serialize()
					)
				}
			}}
		>	
			{#if isProcessing}
				<Icon style="left: 0.6rem; position:absolute;">
					<FaStop />
				</Icon>	
				Stop all
			{:else}
				<Icon style="left: 0.6rem; position:absolute;">
					<FaPlay />
				</Icon>	
				Run all
			{/if}
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
			{#each $conversionsStore.files.slice(0, perPage * page) as el (el.id)}
				<div
					animate:flip={{duration: 200}}
					in:slide|local
					out:fade|local
				>
					<ElementRow 
						element={el} 
						globals={$globals}
						on:delete={() => conversionsStore.remove(el)}
						on:showResult={(data) => {
							floatingResult = data.detail;
						}}
					/>
				</div>
			{/each}
			<InfiniteScroll threshold={perPage} on:loadMore={() => page++} />
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
		gap: 1rem;
		grid-template-columns: min-content;
		flex: 1;
		padding: 1rem;
		height: 100%;
		position: relative;
	}
	.dropper {
		display: flex;
		flex: 1;
		font-size: 1.3rem;
		font-weight: bold;
		height: 100%;
		justify-content: center;
		gap: 1rem;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
	}
	.elements {
		grid-area: e;
		display: flex;
		gap: 0.5rem;
		overflow-y: scroll;
		padding-right: 0.4rem;
    	margin-right: -0.65rem;
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
		background-color: var(--secondary);
		border-radius: 0.6rem;
		padding: 0.8rem;
	}
</style>
