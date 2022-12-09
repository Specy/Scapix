<script lang="ts">
	import { FileType, type ConversionFile } from '$stores/conversionStore';
	export let element: ConversionFile;

	let type = element.getType();
    let path = element.file.path.replaceAll("\\", "\\\\");
    $: {
        type = element.getType();
        path = element.file.path.replaceAll("\\", "\\\\");
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
        {element.file.name}
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
        
        background: linear-gradient(90deg, rgba(var(--RGB-secondary), 0.6001751042) 0%, rgba(var(--RGB-secondary), 0.8994748241) 30%, rgba(var(--RGB-secondary), 0.98) 60%);
	}
    .row-content{
        display: flex;   
        padding: 1rem;
        z-index: 10;
    }
</style>
