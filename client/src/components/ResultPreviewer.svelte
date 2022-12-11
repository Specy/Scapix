<script lang="ts">
	import { FileType } from "$common/types/Files";
	import { toResourceUrl } from "$lib/utils";
	import type { ConversionDiff } from "$stores/conversionStore";
	import { createEventDispatcher } from "svelte";
	import FaTimes from "svelte-icons/fa/FaTimes.svelte";
	import { fade } from "svelte/transition";
	import Button from "./buttons/Button.svelte";
	import Icon from "./layout/Icon.svelte";


    export let diff:ConversionDiff|undefined;
    let showingOriginal = false;
    const dispatcher = createEventDispatcher<{
        close: undefined;
    }>();   
    $: if(!diff){
        showingOriginal = false;
    }
</script>


{#if diff}
    <div 
        in:fade={{duration: 150}}
        out:fade={{duration: 150}}
        class="floating-wrapper"
    >
        {#if diff.original.settings.type === FileType.Video}
            <video 
                src={toResourceUrl(showingOriginal ? diff.original.file.path : diff.converted)} 
                class="element" 
                alt={showingOriginal ? "Original" : "Converted"}
                controls
            />
        {:else}
            <img 
                src={toResourceUrl(showingOriginal ? diff.original.file.path : diff.converted)} 
                class="element" 
                alt={showingOriginal ? "Original" : "Converted"}
            />
        {/if}

        <div class="floating-type">
            <Button
                on:click={() => showingOriginal = !showingOriginal}
                cssVar={showingOriginal ? "primary" : "accent"}
                style="
                    min-width: 7rem; 
                    font-weight: bold;
                    background-color: rgba(var(--RGB-{showingOriginal ? "primary" : "accent"}), 0.7); 
                    backdrop-filter: blur(0.1rem);
                "
            >
                {#if showingOriginal}
                    Original
                {:else}
                    Converted
                {/if}
            </Button>
        </div>
        <div class="top-right">
            <Button
                on:click={() => dispatcher("close")}
                cssVar="accent2"
                style="padding: 0.4rem; background-color: rgba(var(--RGB-accent2), 0.7); backdrop-filter: blur(0.1rem);"
            >
                <Icon>  
                    <FaTimes />
                </Icon>
            </Button>
        </div>
    </div>
{/if}



<style lang="scss">
    .floating-wrapper{
        display: flex;
        position: absolute;
        top: 0;
        align-items: center;
        justify-content: center;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(var(--RGB-primary), 0.2);
        backdrop-filter: blur(0.2rem);
        z-index: 20;
        padding: 1rem;
    }
    .floating-type{
        position: absolute;
        top: 1.8rem;
        left: 50%;
        transform: translateX(-50%);
        color: var(--primary-text);
    }
    .element{
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .top-right{
        position: absolute;
        top: 1.8rem;
        right: 1.8rem;
    }

</style>