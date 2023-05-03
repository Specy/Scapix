<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let value: number;
	export let placeholder = '';
	export let style = '';
	export let step = 1;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	function onBlur(e: Event) {
		// @ts-ignore
		const v = e.target.value;
		let parsed = Number(v);
		if (!Number.isFinite(parsed) || !v) {
			parsed = 0;
		} else {
			if (min !== undefined && parsed < min) {
				parsed = min;
			} else if (max !== undefined && parsed > max) {
				parsed = max;
			}
			if (parsed % step !== 0) {
				//TODO should i add this?
				//parsed = Number((Math.round(parsed / step) * step).toPrecision(2))
			}
		}
		if (parsed !== value) {
			value = parsed;
			dispatcher('change', parsed);
		} else {
			value = parsed;
		}
	}
	function onChange(e: Event) {
		// @ts-ignore
		const v = e.target.value as string;
		dispatcher('change', Number(v));
	}
	const dispatcher = createEventDispatcher<{ change: number }>();
</script>

<input
	type="number"
	bind:value
	{step}
	{min}
	class="form-input"
	on:blur={onBlur}
	on:change={onChange}
	{placeholder}
	{style}
/>

<style lang="scss">
	.form-input {
		display: flex;
		align-items: center;
		border-radius: 0.4rem;
		padding: 0.2rem;
		background-color: var(--tertiary);
		color: var(--tertiary-text);
		padding: 0.6rem 1rem;
	}
	input::placeholder {
		color: rgb(116, 116, 116);
		font-size: 0.8rem;
	}
</style>
