<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SchemaType, ConcreteSchema } from '$common/types/Files';
	import SettingsElement from './SettingsElement.svelte';

	type K = $$Generic<string>;
	type S = $$Generic<Record<K, SchemaType>>;
	const dispatcher = createEventDispatcher<{
		change: {
			key: K;
			value: S[K];
		};
		reset: {
			key: K;
		};
	}>();

	export let schema: S;
	export let options: {
		[key in keyof S]: ConcreteSchema<S[key]>;
	};
	export let inputStyle: string = '';
	export let globalValues: Record<string, SchemaType> = {};
	export let hideReset = false;
	let schemaProps = Object.entries(schema) as [K, SchemaType][];
	$: schemaProps = Object.entries(schema) as [K, SchemaType][];
</script>

{#each schemaProps as [propName, prop]}
	{#if !prop.hidden}
		<SettingsElement
			schema={prop}
			isDefault={options[propName] === undefined}
			{hideReset}
			value={options[propName] ?? globalValues[propName] ?? prop.default}
			name={propName}
			on:change={(e) =>
				dispatcher('change', {
					key: propName,
					value: e.detail
				})}
			on:reset={() =>
				dispatcher('reset', {
					key: propName
				})}
			style={inputStyle}
		/>
	{/if}
{/each}

<style lang="scss">
	.options {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
