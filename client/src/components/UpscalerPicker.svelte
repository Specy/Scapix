<script lang="ts">
	import { Upscaler } from "$common/types/Files";
	import { capitalize } from "$lib/utils";
	import { createEventDispatcher } from "svelte";
	import Select from "./inputs/Select.svelte";
    export let style = ""
    export let value:Upscaler
    const values = Object.values(Upscaler)
    const dispatcher = createEventDispatcher<{change: Upscaler}>()
</script>


<Select
    {style}
    bind:value
    on:change={(e) => {
        dispatcher("change", e.target.value)
    }}
>
    {#each values as value}
        <option value={value}>
            {capitalize(value)}
        </option>
    {/each}
</Select>