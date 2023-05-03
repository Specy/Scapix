<script lang="ts">
	import type { FileTypes } from '$common/types/Files';
	import { toResourceUrl } from '$lib/utils';
	import type { ConversionDiff, ConversionFile } from '$stores/conversionStore';
	import { createEventDispatcher, onMount } from 'svelte';
	import FaTimes from 'svelte-icons/fa/FaTimes.svelte';
	import FaAngleRight from 'svelte-icons/fa/FaAngleRight.svelte';
	import FaAngleLeft from 'svelte-icons/fa/FaAngleLeft.svelte';
	import { fade } from 'svelte/transition';
	import Button from './buttons/Button.svelte';
	import Icon from './layout/Icon.svelte';
	let wrapper: HTMLDivElement | null = null;
	let rect: DOMRect | undefined;
	let observer: ResizeObserver | undefined;
	let thumbPosition = 0;
	let clicking = false;
	export let next: ConversionFile<FileTypes> | undefined;
	export let previous: ConversionFile<FileTypes> | undefined;
	export let diff: ConversionDiff | undefined;
	export let showingOriginal = false;
	const dispatcher = createEventDispatcher<{
		close: undefined;
		onNext: ConversionFile<FileTypes>;
		onPrevious: ConversionFile<FileTypes>;
	}>();
	onMount(() => {
		thumbPosition = calculateMiddle();
	});
	function calculateMiddle() {
		if (typeof window === 'undefined') return 0;
		return (window.innerWidth - (rect?.left ?? 0)) / 2;
	}
	$: if (!diff) {
		showingOriginal = false;
		thumbPosition = calculateMiddle();
	}
	$: if (wrapper) {
		observer?.disconnect();
		observer = new ResizeObserver(() => {
			rect = wrapper?.getBoundingClientRect();
		});
		observer.observe(wrapper);
	}
	$:console.log(diff?.original.settings)
</script>

<svelte:window
	on:pointerup={() => (clicking = false)}
	on:pointercancel={() => (clicking = false)}
	on:blur={() => (clicking = false)}
	on:pointermove={(e) => {
		if (clicking && rect) {
			const x = e.clientX - rect.left;
			thumbPosition = Math.max(0, Math.min(x, rect.width));
		}
	}}
/>

{#if diff}
	<div
		in:fade={{ duration: 150 }}
		out:fade={{ duration: 150 }}
		class="floating-wrapper"
		bind:this={wrapper}
		style="--thumb-position: {thumbPosition}px;"
	>
		<div class="blur-filter" />
		{#if diff.original.settings.opts.type === "video"}
			<video
				src={toResourceUrl(showingOriginal ? diff.original.file.path : diff.converted)}
				class="element"
				controls
			/>
			<div class="floating-type">
				<Button
					on:click={() => (showingOriginal = !showingOriginal)}
					cssVar={showingOriginal ? 'primary' : 'accent'}
					style="
                        min-width: 7rem; 
                        font-weight: bold;
                        background-color: rgba(var(--RGB-{showingOriginal
						? 'primary'
						: 'accent'}), 0.7); 
                        backdrop-filter: blur(0.1rem);
                    "
				>
					{#if showingOriginal}
						Original
					{:else}
						Converted
					{/if}
				</Button>
			</div>
		{:else}
			<img
				src={toResourceUrl(diff.original.file.path)}
				class="element original"
				alt={showingOriginal ? 'Original' : 'Converted'}
			/>
			<img
				src={toResourceUrl(diff.converted)}
				class="element converted"
				alt={showingOriginal ? 'Original' : 'Converted'}
			/>
			<button class="thumb" on:pointerdown={() => (clicking = true)}>
				<div class="row thumb-mid">
					<FaAngleLeft />
					<FaAngleRight />
				</div>
			</button>
		{/if}
		<div class="top-right">
			<Button
				on:click={() => dispatcher('close')}
				cssVar="accent2"
				style="padding: 0.4rem; background-color: rgba(var(--RGB-accent2), 0.7); backdrop-filter: blur(0.1rem);"
			>
				<Icon size={2}>
					<FaTimes />
				</Icon>
			</Button>
		</div>
		{#if next}
			<button
				class="direction-button"
				style="right: 1rem"
				on:click={() => dispatcher('onNext', next)}
			>
				<Icon size={4}>
					<FaAngleRight />
				</Icon>
			</button>
		{/if}
		{#if previous}
			<button
				class="direction-button"
				style="left: 1rem"
				on:click={() => dispatcher('onPrevious', previous)}
			>
				<Icon size={4}>
					<FaAngleLeft />
				</Icon>
			</button>
		{/if}
	</div>
{/if}

<style lang="scss">
	.blur-filter {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(var(--RGB-primary), 0.3);
		backdrop-filter: blur(0.2rem);
		will-change: auto;
	}
	.direction-button {
		position: absolute;
		background-color: transparent;
		color: var(--accent);
		top: calc(50% - 4rem);
		z-index: 100;
		background-color: rgba(var(--RGB-secondary), 0.8);
		border-radius: 0.4rem;
		height: 8rem;
		cursor: pointer;
	}
	.floating-wrapper {
		display: flex;
		position: absolute;
		top: 0;
		align-items: center;
		justify-content: center;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 20;
		padding: 1rem;
	}
	.thumb {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		top: 0;
		left: 0;
		transform: translateX(var(--thumb-position));
		width: 0.4rem;
		opacity: 0.8;
		height: 100%;
		background-color: var(--accent);
		transition: opacity 0.1s;
		z-index: 10;
		user-select: none;
		cursor: ew-resize;
		box-shadow: 0px 0px 4px 0px rgb(39 39 39 / 30%);
		& .thumb-mid {
			align-items: center;
			justify-content: center;
			color: var(--accent-text);
			background-color: var(--accent);
			width: 2.4rem;
			padding: 0.4rem;
			gap: 0.4rem;
			height: 3rem;
			border-radius: 0.5rem;
			cursor: ew-resize;
		}
		&:active {
			opacity: 0.3;
		}
	}

	.floating-type {
		position: absolute;
		top: 1.8rem;
		left: 50%;
		transform: translateX(-50%);
		color: var(--primary-text);
	}
	.element {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.top-right {
		position: absolute;
		top: 1rem;
		right: 1rem;
	}
	.original {
		clip-path: inset(0 calc(100% - var(--thumb-position)) 0 0);
	}
	.converted {
		clip-path: inset(0 0 0 var(--thumb-position));
	}
</style>
