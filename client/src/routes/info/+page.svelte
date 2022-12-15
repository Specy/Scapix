<script>
	import Title from "$cmp/layout/Title.svelte";
	import FaArrowRight from "svelte-icons/fa/FaArrowRight.svelte";
	import FaArrowLeft from "svelte-icons/fa/FaArrowLeft.svelte";
	import FaArrowUp from "svelte-icons/fa/FaArrowUp.svelte";
	import FaArrowDown from "svelte-icons/fa/FaArrowDown.svelte";

</script>


<div class="page">
    <Title noMargin>
        Shortcuts
    </Title>
    <div class="section" style="gap: 1rem; display:flex; flex-direction:column">
        <div class="shortcut">
            <div class="icon">
                <FaArrowLeft />
                <FaArrowRight />
            </div>
            Toggle between upscaled and not upscaled in the image/video preview
        </div>
        <div class="shortcut">
            <div class="icon">
                <FaArrowUp />
                <FaArrowDown />
            </div>
            Go to the previous/next upscaled image/video
        </div>
    </div>
    <Title noMargin>
        Upscalers
    </Title>
    <div class="section"> 
        There are two kinds of upscalers:
        <ul>
            <li><b>Waifu2X</b>: More settings to choose from but slightly worse overall for drawings, can be extended with your own custom models, mainly uses GPU</li>
            <li><b>Real Esrgan</b>: Less settings but better for drawings, can only work with scales between 2 and 4. It is slower than waifu2x, mainly uses CPU</li>
        </ul>
    </div>
    <Title noMargin>
        Waifu2X
    </Title>
    <div class="section">
        <b>Waifu2x</b> has different options to chose from:
        <ul>
            <li>
                <b>Model</b>: Different kinds of models give different results for a given input, the default models are 
                "Drawings" for drawings and anime, and "Photo" for realistic images.
                You can upload your own model to use in the app by adding a folder in the 
                <a
                    class="external-link"
                    on:click={() => window.api.openDir("./models")}
                >
                    models folder 
                </a> in the root of the app.
            </li>
            <li>
                <b>Scale</b>: The scale to which the image will be upscaled, the default is 2x. 
            </li>
        </ul>
    </div>
    <Title noMargin>
        Real ESRGAN
    </Title>
    <div class="section">
        For Real ESRGAN you can choose only the scale, it works only for values between 2 and 4, when using the 4x scale you will 
        get the best results.
    </div>
    <Title noMargin>
        Other settings
    </Title>
    <div class="section">
        <li>
            <b>Quality</b>: (Only video, gif and webp) The quality of the output, lower is better, values between 1 and 51
        </li>
        <li>
            <b>Speed:</b> (Only video, gif and webp) The reproduction speed of the output, 1 is normal speed.
        </li>
        <li>
            <b>Cumulative</b>: (Only gif) If the output should be a cumulative gif or not.
        </li>
        <li>
            <b>Transparency</b>: (Only gif) If the output should have transparency or not.
        </li>
    </div>
    <Title noMargin>
        Local and global settings
    </Title>
    <div class="section">
        You can set default settings that will be used by all images/videos that you select, you can then override those
        individually for each image/video.
    </div>
</div>

<style>
    .page{
        display: flex;
        flex-direction: column;
        padding: 2rem;
        line-height: 1.5rem;
        overflow-y: auto;
        gap: 1rem;
    }
    .icon{
        height: 1.5rem;
        display: flex;
        gap: 0.8rem;
    }
    .shortcut{
        display:flex;
        align-items: center;
        gap: 0.8rem;
    }
    .section{
        padding-left: 1rem;
        margin-bottom: 2rem;
        max-width: 45rem;
    }
    .external-link{
		color: var(--accent);
		display: inline-block;
		cursor: pointer;
	}
    ul{
        padding: 0.4rem;
        padding-left: 1.2rem;
    }
    b{
        font-size: 1.1rem;
        text-decoration: underline;
    }
</style>