<script lang="ts">
	import { createEventDispatcher } from "svelte";

    export let formats: string[]
    export let force = false
    export let value: string

    const dispatcher = createEventDispatcher<{
        change: string
    }>()

    function onChange(e: Event) {
        dispatcher("change", (e.target as HTMLSelectElement).value)
    }

    $: if(!formats.includes(value)){
        value = formats[0]
        dispatcher("change", value)
    }
</script>


<select
    bind:value
    class="format-picker"
    on:change={onChange}
>
    {#each formats as format}
        <option value={format}>.{format}</option>
    {/each}
</select>


<style lang="scss">
    .format-picker{
        font-family: Orienta;
        font-size: 1.1rem;
        font-weight: 500;
        background-color: unset;
        text-decoration: underline;
        appearance: none;
        border: unset;
        margin-left: -0.4rem;
        padding: 0 0.3rem;
        cursor: pointer;
        color: var(--accent);
    }
    .format-picker option{
        background-color: var(--primary);
        color: var(--primary-text);
        font-size: 1rem;
    }

</style>