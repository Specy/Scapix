<script lang="ts">
	import Select from '$cmp/inputs/Select.svelte';
	import { capitalize } from '$lib/utils';
	import { slide } from 'svelte/transition';
	import ElementSettingsRow from './ElementSettingsRow.svelte';
	import NumberInput from '$cmp/inputs/NumberInput.svelte';
	import type { SchemaType, ConcreteSchema } from '$common/types/Files';
	import { createEventDispatcher } from 'svelte';
	import Input from '$cmp/inputs/Input.svelte';
	type T = $$Generic<SchemaType>;

	const dispatcher = createEventDispatcher<{
		change: ConcreteSchema<T>;
		reset: void
	}>();
	export let schema: T;
	export let value: ConcreteSchema<T>;
	export let name: string;
	export let style: string = '';
    export let hideReset:boolean = false;
	export let isDefault: boolean
</script>

<ElementSettingsRow 
	title={capitalize(name)} 
	{isDefault}
	on:reset
	style='width:100%' {hideReset}
>
	{#if schema.type === 'number'}
		<NumberInput 
			{value} 
			on:change={(e) => dispatcher('change', e.detail)} 
			{style} 
			min={schema.min}
			max={schema.max}
			step={schema.increment}
		/>
	{:else if schema.type === 'string'}
		<Input {value} on:change={(e) => dispatcher('change', e.target.value)} {style} />
	{:else if schema.type === 'boolean'}
		<input
			type="checkbox"
			checked={value}
			{style}
			on:change={(e) => dispatcher('change', e.target.checked)}
		/>
	{:else if schema.type === 'list'}
		<Select
			{value}
			{style}
			on:change={(e) => {
				dispatcher('change', e.target.value);
			}}
		>
			{#each schema.items as value}
				<option {value}>
					{capitalize(value)}
				</option>
			{/each}
		</Select>
	{:else}
		<p>Unknown type: {schema.type}</p>
	{/if}
</ElementSettingsRow>
