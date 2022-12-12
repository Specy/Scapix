<script lang="ts">
	import RgbLine from '$cmp/misc/RgbLine.svelte';
	import FaTimes from 'svelte-icons/fa/FaTimes.svelte';
	import Icon from './Icon.svelte';
	import FaWindowMaximize from 'svelte-icons/fa/FaWindowMaximize.svelte';
	import FaRegWindowMaximize from 'svelte-icons/fa/FaRegWindowMaximize.svelte';
	import FaMinus from 'svelte-icons/fa/FaMinus.svelte';
	import { onMount } from 'svelte';
	import { titleBarStore } from '$stores/titleBarStore';
	let maximized = false;
	onMount(() => {
		const id = window.controls.addOnMaximizationChange((e) => (maximized = e));
		return () => {
			window.controls.removeOnMaximizationChange(id);
		};
	});
</script>

<div class="bar">
	<div class="content">
		<button 
			class="maximize"
			on:dblclick={() => {
				//this does not trigger
				window.controls.toggleMaximize()
			}}
		>

		</button>
		<div class="controls">
			<button class="control-button" on:click={() => window.controls.minimize()}>
				<Icon size={0.9}>
					<FaMinus />
				</Icon>
			</button>
			<button class="control-button" on:click={() => window.controls.toggleMaximize()}>
				<Icon size={0.8}>
					{#if maximized}
						<FaWindowMaximize />
					{:else}
						<FaRegWindowMaximize />
					{/if}
				</Icon>
			</button>
			<button class="control-button" on:click={() => window.controls.close()}>
				<Icon size={0.9}>
					<FaTimes />
				</Icon>
			</button>
		</div>
	</div>
	<div class="line">
		{#key $titleBarStore.barPosition}
			<div class="line-inner" style={`--to: ${$titleBarStore.barPosition}%`}>
				<RgbLine height="0.3rem" style="border-top-right-radius: 0; transform: rotate(180deg)" />
			</div>
		{/key}
	</div>
</div>

<style lang="scss">
	.control-button {
		background-color: var(--primary);
		color: var(--primary-text);
		padding: 0.6rem 1rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}
	.control-button:hover {
		background-color: var(--secondary);
	}
	.content {
		display: flex;
		min-height: 1.4rem;
	}
	.controls {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-left: auto;
	}
	.maximize{
		display: flex;
		flex: 1;
		-webkit-app-region: drag;
	}
	.line {
		padding-right: 0.4rem;
		overflow: hidden;
		border-top-left-radius: 0.2rem;
		margin-left: 3.6rem;
	}
	.line-inner {
		width: 100%;
		min-width: 1rem;
        animation: forwards animate 0.4s;
	}
	.bar {
		display: flex;
		flex-direction: column;
		
		user-select: none;
		width: 100%;
	}
    @keyframes animate {
        from {
            width:1rem;
        }
        to {
            width: var(--to);
        }
    }
</style>
