<script>
	export let to = '';
</script>

{#if to}
	<a href={to} on:click class="side-menu-option">
		<slot />
	</a>
{:else}
	<button on:click class="side-menu-option">
		<slot />
	</button>
{/if}

<style lang="scss">
	.side-menu-option {
		display: flex;
		width: 3rem;
		height: 3rem;
		cursor: pointer;
		padding: 0.6rem;
		border-radius: 0.3rem;
		transition: all 0.2s;
		background-color: var(--primary);
	}
	.side-menu-option:hover {
		background-color: var(--tertiary);
	}
	button {
		background: none;
		border: none;
		border-radius: 0.4rem;
		background-color: var(--secondary);
		padding: 0;
		cursor: pointer;
	}
</style>
