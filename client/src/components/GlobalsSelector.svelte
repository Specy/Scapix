<script lang="ts">
	import type { GlobalSettings } from "$common/types/Files";
	import { fade } from "svelte/transition";
	import DenoiseLevelPicker from "./DenoiseLevelPicker.svelte";
	import NumberInput from "./inputs/NumberInput.svelte";
	import UpscalerPicker from "./UpscalerPicker.svelte";
	import Waifu2xModelPicker from "./Waifu2xModelPicker.svelte";
    export let globals:GlobalSettings
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
        <DenoiseLevelPicker 
            bind:value={globals.denoise}
        />
    </div>
    <div class="column">
        <div class="title">
            Upscaler
        </div>
        <UpscalerPicker 
            bind:value={globals.upscaler}
        />
    </div>
    {#if globals.upscaler === "waifu2x"}
        <div class="column">
            <div class="title">
                Waifu2x model
            </div>
            <Waifu2xModelPicker 
                bind:value={globals.waifu2xModel}
            />
        </div>
    {/if}
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