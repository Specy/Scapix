<script lang="ts">
	import { capitalize } from "$lib/utils";
	import { DenoiseLevel } from "$common/types/Files";
	import { createEventDispatcher } from "svelte";
	import Select from "./inputs/Select.svelte";
    export let value:DenoiseLevel
    const denoiseLevels = Object.values(DenoiseLevel)
    const dispatcher = createEventDispatcher<{change: DenoiseLevel}>()
    export let style = ""

    function onChange(e: Event){
        // @ts-ignore
        dispatcher("change", e.target.value)
    }
</script>



<Select 
    bind:value
    {style}
    on:change={onChange}
>
    {#each denoiseLevels as level}
        <option 
            value={level}
        >
            {capitalize(level)}
        </option>
    {/each}

</Select>