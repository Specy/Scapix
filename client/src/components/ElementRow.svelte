<script lang="ts">
	import { FileType, type ConversionFile } from '$stores/conversionStore';
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte'
import prettyBytes from 'pretty-bytes';
	export let element: ConversionFile;

	let type = element.getType();
    let path = element.file.path.replaceAll("\\", "\\\\");
    $: {
        type = element.getType();
        path = element.file.path.replaceAll("\\", "\\\\");
    }

	$: console.log(element.finalName)
	function onNameChange(e: Event) {
		element.finalName = (e.target as HTMLDivElement).innerText;
	}
</script>

<div class="el-row">
	<div class="el-background">
		{#if [FileType.Image, FileType.Gif, FileType.Webp].includes(type)}
			<div class="el-background-image" style={`background-image: url(resource://${path});`} />
		{:else if type === FileType.Video}
			video
		{:else}
			unknown
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
					{element.stats.width}x{element.stats.height}
				</div>
			</div>
		</div>
		<div class="actions">
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
        filter: blur(0.4rem);
		width: 100%;
		background-size: cover;
		background-position: center;
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
		justify-content: space-between;
        padding: 0.8rem 1rem;
        z-index: 10;
    }
	.stats{
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.2rem;
		text-shadow: 0px 0px 8px #000;
	}
	.actions{
		display: flex;
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
