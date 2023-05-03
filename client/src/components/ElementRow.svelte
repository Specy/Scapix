<script lang="ts">
	import { type FileTypes, Status } from '$common/types/Files';
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte';
	import FaPlay from 'svelte-icons/fa/FaPlay.svelte';
	import FaStop from 'svelte-icons/fa/FaStop.svelte';
	import FaEdit from 'svelte-icons/fa/FaEdit.svelte';
	import prettyBytes from 'pretty-bytes';
	import { capitalize, clamp, toResourceUrl } from '$lib/utils';
	import Icon from './layout/Icon.svelte';
	import FaCog from 'svelte-icons/fa/FaCog.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { ConversionDiff, ConversionFile } from '$stores/conversionStore';
	import { settingsStore } from '$stores/settingsStore';
	import StatusBar from './StatusBar.svelte';
	import ResultDisplayer from './ResultDisplayer.svelte';
	import { toast } from '$stores/toastStore';
	import FormatPicker from './FormatPicker.svelte';
	import Select from './inputs/Select.svelte';
	import { createDerivedSchemaStore, schemaStore } from '$stores/schemaStore';
	import { slide } from 'svelte/transition';
	import SettingsRenderer from './Settings/SettingsRenderer.svelte';
	import ElementSettingsRow from './Settings/ElementSettingsRow.svelte';

	export let element: ConversionFile<FileTypes>;
	let type = element.getType();
	let path = toResourceUrl(element.file.path);
	let scaleFactor = 2;
	let videoRef: HTMLVideoElement;
	let settingsOpen = false;
	let fileFormat = (/[^./\\]*$/.exec(element.finalName) || [''])[0];
	const dispatcher = createEventDispatcher<{
		delete: undefined;
		showResult: ConversionDiff;
	}>();
	$: {
		type = element.getType();
		path = toResourceUrl(element.file.path);
	}

	let status = element.status.status;
	let upscaler = element.settings.upscaler ?? $schemaStore.currentUpscaler;
	let schema = createDerivedSchemaStore(upscaler, type);
	$: fileFormat = (/[^./\\]*$/.exec(element.finalName) || [''])[0];
	$: status = element.status.status;
	$: scaleFactor = element.settings.opts.values.scale ?? $schemaStore.currentGlobalSettings!.scale;
	$: {
		if (element.settings.upscaler !== upscaler) {
			let newUpscaler = element.settings.upscaler ?? $schemaStore.currentUpscaler;
			upscaler = newUpscaler;
			schema = createDerivedSchemaStore(newUpscaler, type);
		}
	}
	function onNameChange(e: Event) {
		element.finalName = (e.target as HTMLDivElement).innerText;
	}
</script>

<div
	class="el-row"
	on:mouseover={() => videoRef?.play()}
	on:mouseleave={() => setTimeout(() => videoRef?.pause(), 300)}
	on:blur={() => videoRef?.pause()}
	on:focus={() => videoRef?.play()}
>
	<div class="el-background">
		{#if ['image', 'gif', 'webp', 'webpAnimated'].includes(type)}
			<div
				class="el-background-image"
				style={`background-image: url(${path}`}
				class:noAnimate={type === 'gif' || type === 'webpAnimated'}
			/>
		{:else if type === 'video'}
			<video src={path} muted bind:this={videoRef} loop class="el-background-video" />
		{:else}
			{element.file.type} - {type}
		{/if}
		<div class="el-mask" class:gif={type === 'gif'} />
	</div>
	<div
		class="row-content"
		class:error={status === Status.Error}
		class:done={status === Status.Done}
	>
		<div class="stats">
			<div class="file-name">
				<div
					contenteditable="true"
					spellcheck="false"
					on:input={onNameChange}
					class="content-editable-name"
				>
					{element.finalName.replace(/.[^./\\]*$/, '')}
				</div>
				{#if ['image', 'webp'].includes(type)}
					<FormatPicker
						formats={['png', 'webp', 'jpg', 'jpeg']}
						force
						value={fileFormat}
						on:change={(e) => {
							element.finalName = element.finalName.replace(/[^./\\]*$/, e.detail);
						}}
					/>
				{:else}
					<div style="margin-left: -0.1rem; cursor: default">
						.{fileFormat}
					</div>
				{/if}
				<button class="rename">
					<FaEdit />
				</button>
			</div>
			<div style="margin-top: auto; display:flex">
				<div style="margin-right: 0.8rem">
					{prettyBytes(element.stats.size)}
				</div>
				<div>
					{capitalize(type)}
				</div>
			</div>
			<div class="sizes-stats">
				<div>
					{element.stats.width}x{element.stats.height}
				</div>
				<div style="width: 1rem">
					<FaArrowRight />
				</div>
				<div>
					{(element.stats.width * scaleFactor).toFixed(0)}
					x
					{(element.stats.height * scaleFactor).toFixed(0)}
				</div>
			</div>
		</div>
		<div class="mid">
			{#if element.status.status === Status.Converting && element.status.currentFrame}
				<StatusBar
					percentage={clamp(
						(element.status.currentFrame / (element.status.totalFrames || 1)) * 100,
						0,
						99
					)}
					showPercentage
					style="max-width: 20rem"
				/>
			{/if}
		</div>
		<div style="display: flex; align-items: center; justify-content: center;">
			<ResultDisplayer
				status={element.status}
				on:showError={(e) => {
					toast.error(e.detail, 10000);
					console.error(e.detail);
				}}
				on:showResult={(result) => {
					dispatcher('showResult', {
						original: element,
						converted: result.detail
					});
				}}
			/>
		</div>
		<div class="actions">
			<button
				style="--normal: rgba(var(--RGB-tertiary), 0.4); --hover: rgba(var(--RGB-tertiary), 0.8);"
				class="action-button"
				class:active={settingsOpen}
				on:click={() => (settingsOpen = !settingsOpen)}
			>
				<Icon>
					<FaCog />
				</Icon>
			</button>
			<button
				style="--normal: rgba(var(--RGB-green), 0.1); --hover: rgba(var(--RGB-green), 0.5);"
				class="action-button"
				on:click={() => {
					if (status === Status.Converting) {
						window.api.haltOne(element.serialize());
					} else {
						window.api.executeFiles(
							[element.serialize()],
							schemaStore.getSerializedGlobalSettings(),
							settingsStore.serialize()
						);
					}
				}}
			>
				<Icon>
					{#if status === Status.Converting}
						<FaStop />
					{:else}
						<FaPlay />
					{/if}
				</Icon>
			</button>
			<button
				style="--normal: rgba(var(--RGB-red), 0.1); --hover: rgba(var(--RGB-red), 0.5);"
				class="action-button"
				on:click={() => {
					dispatcher('delete');
				}}
			>
				<Icon>
					<FaTrashAlt />
				</Icon>
			</button>
		</div>
	</div>
	{#if settingsOpen && $schemaStore.currentGlobalSettings}
		<div class="settings" transition:slide={{ duration: 200 }}>
			<div class="options">
				<ElementSettingsRow
					isDefault={element.settings.upscaler === undefined}
					on:reset={() => {
						element.settings.upscaler = undefined;
					}}
					title="Upscaler"
				>
					<Select
						style="width: 8rem"
						on:change={(e) => {
							element.settings.upscaler = e.target.value;
						}}
						value={element.settings.upscaler ?? $schemaStore.currentUpscaler}
					>
						{#each Object.keys($schemaStore.schema) as name}
							<option value={name}>{capitalize(name)}</option>
						{/each}
					</Select>
				</ElementSettingsRow>
				<SettingsRenderer
					schema={$schema}
					options={element.settings.opts.values}
					inputStyle="width: 8rem"
					globalValues={$schemaStore.currentGlobalSettings}
					on:reset={(e) => {
						const { key } = e.detail;
						delete element.settings.opts.values[key];
						element = element; // force update
					}}
					on:change={(e) => {
						const { key, value } = e.detail;
						element.settings.opts.values[key] = value;
					}}
				/>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.settings {
		z-index: 10;
		padding: 1rem;
		margin: 0.5rem;
		border-radius: 0.3rem;
		background-color: rgba(var(--RGB-secondary), 0.5);
		gap: 0.4rem;
		display: flex;
		flex-direction: column;
	}
	.options {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		row-gap: 0.4rem;
		column-gap: 2rem;
		margin-left: 0.8rem;
	}
	.el-row {
		display: flex;
		flex-direction: column;
		border-radius: 0.5rem;
		overflow: hidden;
		position: relative;
		background-color: var(--secondary);
	}
	.el-background,
	.el-background-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	.mid {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
	}
	.el-background-image {
		border-radius: 0.2rem;
		filter: blur(0.3rem);
		width: 100%;
		background-size: cover;
		background-position: center;
		&.noAnimate {
			filter: none;
		}
	}
	.el-background-video {
		width: 100%;
		filter: blur(0.3rem);
		height: 100%;
		object-fit: cover;
	}

	.action-button {
		height: 100%;
		border-radius: 0.3rem;
		color: var(--secondary-text);
		padding: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
		background-color: var(--normal);
		&:hover {
			background-color: var(--hover);
		}
		&.active {
			background-color: var(--accent2);
		}
	}
	.el-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgb(var(--RGB-secondary));
		background: linear-gradient(
			90deg,
			rgba(var(--RGB-secondary), 0.6001751042) 0%,
			rgba(var(--RGB-secondary), 0.8994748241) 30%,
			rgba(var(--RGB-secondary), 0.99) 60%
		);
		&.gif {
			background: linear-gradient(
				90deg,
				rgba(var(--RGB-secondary), 0.8001751042) 0%,
				rgba(var(--RGB-secondary), 0.9094748241) 30%,
				rgba(var(--RGB-secondary), 0.99) 60%
			);
		}
	}
	.row-content {
		display: flex;
		flex: 1;
		min-height: 8rem;
		border-radius: 0.5rem;
		justify-content: space-between;
		outline-offset: -0.2rem;
		padding: 0.4rem;
		gap: 0.4rem;
		z-index: 10;
	}
	.stats {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.2rem;
		padding: 0.2rem;
		text-shadow: 0px 0px 8px #000;
	}
	.actions {
		display: flex;
		gap: 0.4rem;
	}
	.file-name {
		display: flex;
		gap: 0.2rem;
		align-items: center;
		.rename {
			display: none;
			align-items: center;
			padding: 0.2rem;
			background-color: transparent;
			color: var(--secondary-text);
			justify-content: center;
			width: 1.5rem;
			pointer-events: none;
		}
		.content-editable-name {
			font-weight: 500;
			font-size: 1.2rem;
			max-width: 18.5rem;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
		.content-editable-name:focus {
			overflow: unset;
			white-space: normal;
		}
		.content-editable-name:hover ~ .rename {
			display: flex;
		}
	}
	.sizes-stats {
		display: flex;
		gap: 0.8rem;
		width: fit-content;
	}
	.error {
		outline: solid 0.2rem var(--red);
	}
	.done {
		outline: solid 0.2rem var(--green);
	}
	@media screen and (max-width: 850px) {
		.actions {
			flex-direction: column;
		}
		.stats {
			max-width: 16rem;
		}
	}
</style>
