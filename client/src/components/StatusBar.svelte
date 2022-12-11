<script lang="ts">
    export let percentage: number;
    export let style: string = ""
    export let showPercentage: boolean = false;
</script>


<div class="status-bar-wrapper" {style}>
    <div 
        class="status-bar"
    >
        <div class="status-bar-inner" style="--percentage: {percentage}%">

        </div>
    </div>
    {#if showPercentage}
        <div class="percentage" style="left: clamp(0px, {percentage}%, calc(100% - 6ch / 2))">
            {percentage.toFixed(0)}%
        </div>
    {/if}
</div>



<style lang="scss">
    .status-bar{
        display: flex;
        align-items: center;
        height: 0.4rem;
        flex: 1;
        border-radius: 1rem;
        overflow: hidden;
        background-color: var(--tertiary);
    }
    .status-bar-wrapper{
        display: flex;
        align-items: center;
        flex: 1;
        height: 100%;
        position: relative;
    }
    .percentage{
        border-radius: 0.4rem;
        background-color: var(--accent2);
        color: var(--accent2-text);
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6ch;
        text-align: center;
        transform: translate(-50%, -50%);
        font-size: 0.8rem;
        padding: 0.2rem 0.4rem;
    }
    .status-bar-inner{
        height: 100%;
        width: 100%;
        transform: translateX(calc(var(--percentage) - 100%));
        background-color: var(--accent2);
        border-radius: 0.5rem;
    }
</style>