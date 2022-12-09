<script lang="ts">
	import { FileType, type ConversionFile, type GlobalSettings } from '$stores/conversionStore';
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte'
	import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte'
	import prettyBytes from 'pretty-bytes';
	import { toResourceUrl } from '$lib/utils';
	import Icon from './layout/Icon.svelte';
	import FaCog from 'svelte-icons/fa/FaCog.svelte';
	import { createEventDispatcher } from 'svelte';
	export let element: ConversionFile;
	export let globals: GlobalSettings;
	let type = element.getType();
    let path = toResourceUrl(element.file.path)
	let scaleFactor = globals.scale;
	let videoRef: HTMLVideoElement;
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
    <div class="row-content">
		<div class="stats">
			<div class="file-name" contenteditable="true" on:input={onNameChange}>
				{element.finalName}
			</div>
			<div style="margin-top: auto;">
				{prettyBytes(element.stats.size)}
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
			<button 
				style="--normal: rgba(var(--RGB-tertiary), 0.1); --hover: rgba(var(--RGB-tertiary), 0.5);"
				class="action-button"
			>
				<Icon>
					<FaCog />
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
</div>

<style lang="scss">
	.el-row {
		display: flex;
		border-radius: 0.4rem;
		outline: solid 0.4rem transparent;
        overflow: hidden;
		position: relative;
        min-height: 8rem;
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
	.action-button{
		border: none;
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
		justify-content: space-between;
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
</style>
