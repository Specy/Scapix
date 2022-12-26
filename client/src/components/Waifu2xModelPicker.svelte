<script lang="ts">
	import { capitalize } from "$lib/utils";
	import { settingsStore } from "$stores/settingsStore";
	import { createEventDispatcher } from "svelte";
	import Select from "./inputs/Select.svelte";    
    export let value:string
    export let style = ""
    const dispatcher = createEventDispatcher<{change: string}>()
</script>

<Select
    bind:value
    on:change={(e) => dispatcher("change", e.detail)}
    {style}
>
    {#each $settingsStore.waifuModels.value as model}
        <option value={model}>
            {capitalize(model)}
        </option>
    {/each}
</Select>

