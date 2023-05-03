<script lang="ts">
	import { capitalize } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';
	import Select from '../inputs/Select.svelte';
	import { schemaStore } from '$stores/schemaStore';
	import type { UpscalerName } from '$common/types/Files';
	export let style = '';
	export let value: UpscalerName;
	export let upscalers 
	const values = Object.values($schemaStore ?? {});
	const dispatcher = createEventDispatcher<{ change: UpscalerName }>();
</script>

<Select
	{style}
	bind:value
	on:change={(e) => {
		dispatcher('change', e.target.value);
	}}
>
	{#each values as value}
		<option {value}>
			{capitalize(value)}
		</option>
	{/each}
</Select>
