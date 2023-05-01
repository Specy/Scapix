<script lang="ts">
	import { UpscalerName } from "$common/types/Files";
	import { capitalize } from "$lib/utils";
	import { createEventDispatcher } from "svelte";
	import Select from "./inputs/Select.svelte";
    export let style = ""
    export let value:UpscalerName
    const values = Object.values(UpscalerName)
    const dispatcher = createEventDispatcher<{change: UpscalerName}>()
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