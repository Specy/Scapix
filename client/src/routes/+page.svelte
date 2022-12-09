<script>
	import DropZone from "$cmp/misc/DropZone.svelte";


</script>

<div class="page">
	<DropZone on:drop={console.log}>
		<div class="dropper">
			Click to select files or drag and drop files here
		</div>
		<div slot="hover" class="dropper">
			Drop files here...
		</div>
	</DropZone>
</div>

<style>
	.page{
		display: flex;
		flex: 1;
		padding: 1rem;
	}
	.dropper{
		display: flex;
		flex: 1;
		font-size: 1.3rem;
		font-weight: bold;
		height: 100%;
		justify-content: center;
		align-items: center;
	}

</style>