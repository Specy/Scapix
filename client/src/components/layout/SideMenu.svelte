<script>
	import RgbLine from "$cmp/misc/RgbLine.svelte";
	export let gap = '1rem';
</script>

<div class="side-menu-wrapper">
	<div class="side-menu" style={`--gap: ${gap}`}>
		<div class="side-menu-slot">
			<slot name="top" />
			<slot />
		</div>
		<div>
			<slot name="bottom" />
		</div>
	</div>
    <div class="line-wrapper">
        <RgbLine height="100%" width="0.3rem" deg={89} style="border-bottom-right-radius: 0; border-bottom-left-radius: 0; transform: rotate(180deg)"/>
    </div>
</div>

<style>
    .side-menu-wrapper{
        display: flex;
        height: 100%;
    }
    .line-wrapper{
        height: 100%;
        padding-bottom: 0.4rem;
    }
	.side-menu {
        padding: 0.3rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-between;
	}
	.side-menu-slot {
		display: flex;
		flex-direction: column;
		gap: var(--gap, 1rem);
	}
</style>
