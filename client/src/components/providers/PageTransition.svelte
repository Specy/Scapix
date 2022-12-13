<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import type { Timer } from '$lib/utils'
	import { titleBarStore } from '$stores/titleBarStore';
	import { fly } from 'svelte/transition'
	export let refresh = ''
	let timeout: Timer
	let timeout2: Timer
	function handleProgress(s: string) {
		return //ignored
		if (s === 'started') {
			clearTimeout(timeout2)
			titleBarStore.setBarPosition(0)
			timeout2 = setTimeout(() => {
				titleBarStore.setBarPosition(100)
			}, 5000)
		}
		if (s === 'ended') {
			clearTimeout(timeout)
			titleBarStore.setBarPosition(0)
			timeout = setTimeout(() => {
				titleBarStore.setBarPosition(100)
			}, 100)
		}
	}

	beforeNavigate((n) => {
		handleProgress('started')
	})
	afterNavigate(() => {
		handleProgress('ended')
	})
</script>

{#key refresh}
	<div in:fly={{ x: -30, duration: 500 }} class="page">
		<slot />
	</div>
{/key}

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

</style>
