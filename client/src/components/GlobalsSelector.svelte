<script lang="ts">
	import { capitalize } from "$lib/utils";
	import { DenoiseLevel, ImageType , type GlobalSettings, } from "$stores/conversionStore";
	import NumberInput from "./inputs/NumberInput.svelte";
	import Select from "./inputs/Select.svelte";
    export let globals:GlobalSettings
    const denoiseLevels = Object.values(DenoiseLevel)
    const imageTypes = Object.values(ImageType)
</script>


<div class="content">
    <div class="column">
        <div class="title">
            Scale
        </div>
        <NumberInput bind:value={globals.scale} step={0.1}/>
    </div>
    <div class="column">
        <div class="title">
            Denoise
        </div>
        <Select 
            bind:value={globals.denoise}
        >
            {#each denoiseLevels as level}
                <option value={level}>{capitalize(level)}</option>
            {/each}
        </Select>
    </div>
    <div class="column">
        <div class="title">
            Image type
        </div>
        <Select 
            bind:value={globals.imageType}
        >
            {#each imageTypes as type}
                <option value={type}>{capitalize(type)}</option>
            {/each}
        </Select>
    </div>
</div>

<style lang="scss">
    .title{
        font-size: 1rem;
        font-weight: bold;
    }
    .content{
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 0.8rem;
    }
    .column{
        display: flex;
        gap: 0.4rem;
        flex-direction: column;
    }
</style>