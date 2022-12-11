<script lang="ts">
	import { FileType, Status, type GlobalSettings } from '$common/types/Files';
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte'
	import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte'
	import FaPlay from 'svelte-icons/fa/FaPlay.svelte'
	import prettyBytes from 'pretty-bytes';
	import { capitalize, toResourceUrl } from '$lib/utils';
	import Icon from './layout/Icon.svelte';
	import FaCog from 'svelte-icons/fa/FaCog.svelte';
	import { createEventDispatcher } from 'svelte';
	import ElementSettings from './ElementSettings.svelte';
	import FaRegClock from 'svelte-icons/fa/FaRegClock.svelte'
	import FaCircleNotch from 'svelte-icons/fa/FaCircleNotch.svelte'
	import type { ConversionFile } from '$stores/conversionStore';
	import { settingsStore } from '$stores/settingsStore';
	export let element: ConversionFile;
	export let globals: GlobalSettings;
	let type = element.getType();
    let path = toResourceUrl(element.file.path)
	let scaleFactor = globals.scale;
	let videoRef: HTMLVideoElement;
	let settingsOpen = false;

	const dispatcher = createEventDispatcher()
    $: {
        type = element.getType();
        path =  toResourceUrl(element.file.path)
    }
	function onNameChange(e: Event) {
		element.finalName = (e.target as HTMLDivElement).innerText;
	}
	$: scaleFactor = element.settings.scale ?? globals.scale;
</script>

<div 
	class="el-row"
	on:mouseover={() => videoRef?.play()}
	on:mouseleave={() => setTimeout(() => videoRef?.pause(), 300)}
	on:blur={() => videoRef?.pause()}
	on:focus={() => videoRef?.play()}
>
	<div class="el-background">
		{#if [FileType.Image, FileType.Gif, FileType.Webp].includes(type)}
			<div class="el-background-image" style={`background-image: url(${path}`} />
		{:else if type === FileType.Video}
			<video 
				src={path} 
				muted 
				bind:this={videoRef}
				loop 
				class="el-background-video"
			/>
		{:else}
			{element.file.type}
		{/if}
		<div class="el-mask" />
	</div>
    <div 
		class="row-content"
		class:error={element.status === Status.Error}
		class:done={element.status === Status.Done}
	>
		<div class="stats">
			<div class="file-name" contenteditable="true" on:input={onNameChange}>
				{element.finalName}
			</div>
			<div style="margin-top: auto; display:flex">
				<div style="margin-right: 0.8rem">
					{prettyBytes(element.stats.size)}
				</div>
				<div>
					{capitalize(element.settings.type)}
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
					{
						(element.stats.width * scaleFactor).toFixed(0)
					}
					x
					{
						(element.stats.height * scaleFactor).toFixed(0)
					}
				</div>
			</div>
		</div>
		<div class="actions">
			{#if element.status === Status.Converting || element.status === Status.Waiting}
				<div style="display:flex; align-items:center; padding-right: 1rem">
					<Icon>
						{#if element.status === Status.Converting}
							<div class="spin">
								<FaCircleNotch />
							</div>
						{:else if element.status === Status.Waiting}
							<FaRegClock />
						{/if}
					</Icon>
				</div>
			{/if}
			<button 
				style="--normal: rgba(var(--RGB-tertiary), 0.4); --hover: rgba(var(--RGB-tertiary), 0.8);"
				class="action-button"
				class:active={settingsOpen}
				on:click={() => settingsOpen = !settingsOpen}
			>
				<Icon>
					<FaCog />
				</Icon>
			</button>
			<button 
				style="--normal: rgba(var(--RGB-green), 0.1); --hover: rgba(var(--RGB-green), 0.5);"
				class="action-button"
				on:click={() => {
					window.api.executeFiles([element.serialize()], globals, settingsStore.serialize())
				}}
			>
				<Icon>
					<FaPlay />
				</Icon>
			</button>
			<button
				style="--normal: rgba(var(--RGB-red), 0.1); --hover: rgba(var(--RGB-red), 0.5);"
				class="action-button"
				on:click={() => {
					dispatcher('delete')
				}}
			>
				<Icon>
					<FaTrashAlt />
				</Icon>
			</button>
		</div>
    </div>
	{#if settingsOpen}
	<ElementSettings 
		{globals}
		bind:settings={element.settings}
	/>
{/if}
</div>

<style lang="scss">
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
	.el-background-image {
		border-radius: 0.2rem;
        filter: blur(0.3rem);
		width: 100%;
		background-size: cover;
		background-position: center;
	}
	.el-background-video{
		width: 100%;
        filter: blur(0.3rem);
		height: 100%;
		object-fit: cover;
	}
	.spin{
		animation: spin 1s linear infinite;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1/1;
	}
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	.action-button{
		height:100%; 
		border-radius: 0.3rem;
		color: var(--secondary-text);
		padding: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
		background-color: var(--normal);
		&:hover{
			background-color: var(--hover);
		}
		&.active{
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
        background: linear-gradient(90deg, rgba(var(--RGB-secondary), 0.6001751042) 0%, rgba(var(--RGB-secondary), 0.8994748241) 30%, rgba(var(--RGB-secondary), 0.99) 60%);
	}
    .row-content{
        display: flex;   
		flex: 1;
        min-height: 8rem;
		border-radius: 0.5rem;
		justify-content: space-between;
		outline-offset: -0.2rem;
        padding: 0.4rem;
        z-index: 10;
    }
	.stats{
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.2rem;
		padding: 0.2rem;
		text-shadow: 0px 0px 8px #000;
	}
	.actions{
		display: flex;
		gap: 0.4rem;
	}
	.file-name{
		font-size: 1.2rem;
		font-weight: 500;
		overflow: hidden;
		max-width: 20rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sizes-stats{
		display: flex;
		gap: 0.8rem;
		width: fit-content;
	}
	.error{
		outline: solid 0.2rem var(--red);
	}
	.done{
		outline: solid 0.2rem var(--green);
	}
</style>
