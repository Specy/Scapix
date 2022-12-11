<script lang="ts">
	import { capitalize } from "$lib/utils";
    import { FileType, Upscaler, type GlobalSettings, type LocalSettings } from "$common/types/Files";
	import { slide } from "svelte/transition";
	import DenoiseLevelPicker from "./DenoiseLevelPicker.svelte";
    import ElementSettingsRow from "./ElementSettingsRow.svelte";
    import NumberInput from "./inputs/NumberInput.svelte";
	import UpscalerPicker from "./UpscalerPicker.svelte";
	import Waifu2xModelPicker from "./Waifu2xModelPicker.svelte";
    export let settings:LocalSettings
    export let globals:GlobalSettings


    function resetProp(prop: string){
        //@ts-ignore 
        settings[prop] = undefined //cause rerender
        //@ts-ignore 
        delete settings[prop] //remove from object
    }
</script>


<div
    class="settings"
    transition:slide={{ duration: 200 }}
>
    <h3>
        Local Settings
    </h3>
    <div class="options">

        <ElementSettingsRow 
            title="Denoise level"
            isDefault={ settings.denoise === undefined }
            on:reset={() => resetProp("denoise") }
        >
            <DenoiseLevelPicker
                style="width: 8rem"
                on:change={(e) => {
                    settings.denoise = e.detail
                }}
                value={settings.denoise ?? globals.denoise}
            />
        </ElementSettingsRow>
        <ElementSettingsRow 
            title="Upscale level"
            isDefault={ settings.scale === undefined }
            on:reset={() => resetProp("scale")}
        >
            <NumberInput 
                style="width: 8rem"
                value={settings.scale ?? globals.scale} 
                on:change={(e) => settings.scale = e.detail}
                step={0.1}
            />
        </ElementSettingsRow>
        <ElementSettingsRow 
            title="Upscaler type"
            isDefault={ settings.upscaler === undefined }
            on:reset={() => resetProp("upscaler") }
        >
            <UpscalerPicker 
                style="width: 8rem"
                on:change={(e) => {
                    settings.upscaler = e.detail
                }}
                value={settings.upscaler ?? globals.upscaler}
            />
        </ElementSettingsRow>
        {#if (settings.upscaler ?? globals.upscaler) === Upscaler.Waifu2x}
            <ElementSettingsRow 
                
                title="Waifu2X model"
                isDefault={ settings.waifu2xModel === undefined }
                on:reset={() => resetProp("waifu2xModel") }
            >
                <Waifu2xModelPicker 
                    style="width: 8rem"
                    on:change={(e) => { 
                        settings.waifu2xModel = e.detail
                    }}
                    value={settings.waifu2xModel ?? globals.waifu2xModel}
                />
            </ElementSettingsRow>
        {/if}
    </div>
    {#if settings.type === FileType.Webp || settings.type === FileType.Gif || settings.type === FileType.Video}
        <h3>
            {capitalize(settings.type)} Settings
        </h3>
        <div class="options">
            {#if settings.type === FileType.Gif}
                    <ElementSettingsRow
                        title="Cumulative"
                        isDefault={ settings.cumulative === undefined }
                        on:reset={() => resetProp("cumulative")}
                    >
                        <input 
                            type="checkbox"
                            checked={settings.cumulative ?? false}
                            on:change={(e) => settings.cumulative = e.target.checked}
                        />
                    </ElementSettingsRow>
                    <ElementSettingsRow
                        title="Transparency"
                        isDefault={ settings.transparency === undefined }
                        on:reset={() => resetProp("transparency")}
                    >
                        <input 
                            type="checkbox"
                            checked={settings.transparency ?? true}
                            on:change={(e) => settings.transparency = e.target.checked}
                        />
                    </ElementSettingsRow>
            {/if}
            <ElementSettingsRow
                title="Quality"
                isDefault={ settings.quality === undefined }
                on:reset={() => resetProp("quality")}
            >
                <NumberInput 
                    style="width: 8rem"
                    value={settings.quality ?? 1} 
                    on:change={(e) => settings.quality = e.detail}
                    step={0.1}
                    min={0}
                />
            </ElementSettingsRow>
            <ElementSettingsRow
                title="Speed"
                isDefault={ settings.speed === undefined }
                on:reset={() => resetProp("speed")}
            >
                <NumberInput 
                    style="width: 8rem"
                    value={settings.speed ?? 1} 
                    on:change={(e) => settings.speed = e.detail}
                    step={0.1}
                    min={0}
                />
            </ElementSettingsRow>
        </div>
    {/if}
</div>




<style lang="scss">
    .settings{
        z-index: 10;
        padding: 1rem;
        margin: 0.5rem;
        border-radius: 0.3rem;
        background-color: rgba(var(--RGB-secondary), 0.5);
        gap: 0.4rem;
        display: flex;
        flex-direction: column;
    }
    .options{
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        row-gap: 0.4rem;
        column-gap: 2rem;
        margin-left: 0.8rem;
    }
</style>