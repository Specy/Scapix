<script lang="ts">
	export let value = 0
    export let placeholder = ''
    export let style = ''
	export let step = 1
	function onBlur(e: Event) {
		// @ts-ignore
		const v = e.target.value
		if (!Number.isFinite(Number(v)) || !v) {
			value = 0
		}
	}
</script>

<input
    type="number"
    bind:value
	{step}
    class="form-input"
	on:blur={onBlur}
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
