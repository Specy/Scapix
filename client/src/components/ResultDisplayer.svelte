<script lang="ts">
	import { Status, type StatusUpdate } from "$common/types/Files";
    import Icon from "./layout/Icon.svelte";
    import FaRegClock from 'svelte-icons/fa/FaRegClock.svelte'
	import FaCircleNotch from 'svelte-icons/fa/FaCircleNotch.svelte'
	import FaEye from 'svelte-icons/fa/FaEye.svelte'
	import FaExclamationTriangle from 'svelte-icons/fa/FaExclamationTriangle.svelte'
	import { createEventDispatcher } from "svelte";
    export let status: StatusUpdate
    const dispatcher = createEventDispatcher<{
        showError: string
        showResult: string
    }>()

</script>




{#if status.status === Status.Converting}
    <div style="display:flex; align-items:center; padding-right: 0.8rem">
        <Icon>
            <div class="spin">
                <FaCircleNotch />
            </div>
        </Icon>
     </div>
{:else if status.status === Status.Waiting}
    <div style="display:flex; align-items:center; padding-right: 0.8rem">
        <Icon>
            <FaRegClock />
        </Icon>
    </div>    
{:else if status.status === Status.Error}     
		<button 
            style="--normal: rgba(var(--RGB-tertiary), 0.4); --hover: rgba(var(--RGB-tertiary), 0.8);"
            class="action-button"
            on:click={() => dispatcher('showError', status.error)}
        >
            <Icon style="color: var(--red)">
                <FaExclamationTriangle />
            </Icon>
        </button>
{:else if status.status === Status.Done}
    <button 
        style="--normal: rgba(var(--RGB-tertiary), 0.4); --hover: rgba(var(--RGB-tertiary), 0.8);"
        class="action-button"
        on:click={() => dispatcher("showResult", status.resultPath)}
        >
        <Icon>
            <FaEye />
        </Icon>
    </button>
{/if}



<style lang="scss">
    .spin{
		animation: spin 1s linear infinite;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1/1;
	}
	.action-button{
		height:100%; 
		border-radius: 0.3rem;
		color: var(--secondary-text);
		padding: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
		background-color: var(--normal);
		&:hover{
			background-color: var(--hover);
		}
	}
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
    
</style>