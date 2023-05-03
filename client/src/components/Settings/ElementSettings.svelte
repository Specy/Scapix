<script lang="ts">
	import { slide } from 'svelte/transition';

</script>

<div class="settings" transition:slide={{ duration: 200 }}>
	<h3>Local Settings</h3>
	<div class="options" />
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
</style>
