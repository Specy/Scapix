<script lang="ts">
	import Button from '$cmp/buttons/Button.svelte';
	import DropZone from '$cmp/misc/DropZone.svelte';
	import { conversionsStore, type ConversionDiff, ConversionFile } from '$stores/conversionStore';
	import { Status } from '$common/types/Files';
	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { settingsStore } from '$stores/settingsStore';
	import ResultPreviewer from '$cmp/ResultPreviewer.svelte';
	import FaPlay from 'svelte-icons/fa/FaPlay.svelte';
	import Icon from '$cmp/layout/Icon.svelte';
	import FaStop from 'svelte-icons/fa/FaStop.svelte';
	import InfiniteScroll from 'svelte-infinite-scroll';
	import { schemaStore } from '$stores/schemaStore';
	import type { FileTypes } from '$common/types/Files';
	import SettingsRenderer from '$cmp/Settings/SettingsRenderer.svelte';
	import Select from '$cmp/inputs/Select.svelte';
	import { capitalize, getFileFormat, removeFileFormat } from '$lib/utils';
	import ElementRow from '$cmp/ElementRow.svelte';
	let floatingResult: ConversionDiff | undefined;
	let isProcessing = false;
	let showingOriginal = false;
	$: isProcessing = $conversionsStore.files.some((el) => el.status.status === Status.Converting);
	const perPage = 5;
	let page = 1;
	$: {
		if (page * perPage > $conversionsStore.files.length) {
			page = Math.max(Math.ceil($conversionsStore.files.length / perPage), 1);
		}
	}
	function setFloatingResult(result: ConversionFile<FileTypes> | undefined) {
		if (!result) return;
		if (result.status.status === Status.Done) {
			floatingResult = {
				original: result,
				converted: result.status.resultPath
			};
		}
	}

	onMount(() => {

		function onKeyDown(e: KeyboardEvent) {
			const code = e.code;
			if (code === 'Escape') {
				floatingResult = undefined;
			}
			if ((code === 'ArrowDown' || code === 'ArrowUp') && floatingResult) {
				const next = conversionsStore.getNextValid(
					floatingResult?.original,
					code === 'ArrowDown' ? 'next' : 'previous'
				);
				setFloatingResult(next);
			}
			if ((code === 'ArrowLeft' || code === 'ArrowRight') && floatingResult) {
				showingOriginal = !showingOriginal;
			}
		}

		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	});

</script>

<div class="page">
	<ResultPreviewer
		bind:showingOriginal
		diff={floatingResult}
		next={floatingResult && conversionsStore.getNextValid(floatingResult.original, 'next')}
		previous={floatingResult && conversionsStore.getNextValid(floatingResult.original, 'previous')}
		on:onNext={(e) => setFloatingResult(e.detail)}
		on:onPrevious={(e) => setFloatingResult(e.detail)}
		on:close={() => {
			floatingResult = undefined;
		}}
	/>
	<DropZone
		style="grid-area: d;"
		formats={['Images', 'Videos', 'Gifs', 'Webp']}
		on:drop={(e) => {
			conversionsStore.add(...e.detail);
		}}
	>
		<div class="dropper">
			<div>Drag and drop files here</div>
			<Button cssVar="tertiary">Or select files</Button>
		</div>
		<div slot="hover" class="dropper">Drop files here...</div>
	</DropZone>

	<div class="globals">
		{#if $schemaStore.currentGlobalSchema}
			<div class="column" style="gap: 0.5rem; margin-bottom: 0.5rem; flex: 1">
				Upscaler
				<Select
					on:change={(e) => {
						schemaStore.setCurrentUpscaler(e.target.value);
					}}
					value={$schemaStore.currentUpscaler}
				>
					{#each Object.keys($schemaStore.schema) as name}
						<option value={name}>{capitalize(name)}</option>
					{/each}
				</Select>
				<SettingsRenderer
					hideReset
					schema={$schemaStore.currentGlobalSchema}
					inputStyle="width:100%"
					options={$schemaStore.currentGlobalSettings}
					on:change={(e) => {
						const { key, value } = e.detail;
						schemaStore.setGlobalSettingsValue($schemaStore.currentUpscaler, key, value);
					}}
				/>
			</div>
		{/if}

		<Button
			style="width:100%; margin-top: 0.4rem"
			cssVar="tertiary"
			on:click={() => {
				window.api.openDir($settingsStore.outputDirectory.value);
			}}
		>
			Open results folder
		</Button>
		<Button
			style="width:100%; align-items: center; position: relative; margin-top: 0.4rem"
			cssVar={isProcessing ? 'red' : 'accent'}
			on:click={() => {
				if (isProcessing) {
					window.api.haltAll();
				} else {
					window.api.executeFiles(
						$conversionsStore.files.map((el) => el.serialize()),
						schemaStore.getSerializedGlobalSettings(),
						settingsStore.serialize()
					);
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
			<div class="no-elements" in:fade={{ duration: 100, delay: 200 }}>
				No files selected, go add some!
			</div>
		{:else if $schemaStore.schema}
			{#each $conversionsStore.files.slice(0, perPage * page) as el, i (el.id)}
				<div animate:flip={{ duration: 200 }} in:slide|local out:fade|local>
					<ElementRow
						element={el}
						on:delete={() => conversionsStore.remove(el)}
						on:showResult={(data) => {
							floatingResult = data.detail;
						}}
						on:formatChange={(e) => {
							const nameWithoutFormat = removeFileFormat(el.finalName);
							el.finalName = `${nameWithoutFormat}.${e.detail}`;
						}}
						on:nameChange={(e) => {
							const format = getFileFormat(el.finalName);
							el.finalName = `${e.detail}.${format}`;		
						}}
					/>
				</div>
			{/each}
		{:else}
			Loading models...
		{/if}

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

	.no-elements {
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
	.globals {
		grid-area: s;
		display: flex;
		flex-direction: column;
		flex: 1;
		background-color: var(--secondary);
		border-radius: 0.6rem;
		padding: 0.8rem;
		width: 13rem;
	}
</style>
