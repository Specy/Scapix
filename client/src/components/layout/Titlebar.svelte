<script lang="ts">
	import RgbLine from "$cmp/misc/RgbLine.svelte";
    import FaTimes from 'svelte-icons/fa/FaTimes.svelte'
	import Icon from "./Icon.svelte";
    import FaWindowMaximize from 'svelte-icons/fa/FaWindowMaximize.svelte'
    import FaRegWindowMaximize from 'svelte-icons/fa/FaRegWindowMaximize.svelte'
    import FaMinus from 'svelte-icons/fa/FaMinus.svelte'
	import { onMount } from "svelte";
	import { titleBarStore } from "$stores/titleBarStore";
    let maximized = false
    onMount(() => {
        const id = window.controls.addOnMaximizationChange((e) => maximized = e)
        return () => {
            window.controls.removeOnMaximizationChange(id)
        }
    })
</script>

<div class="bar">
    <div class="content">
        <div>
        </div>
        <div class="controls">
            <button class="control-button" on:click={() => window.controls.minimize()}>
                <Icon size={0.9}>
                    <FaMinus />
                </Icon>
            </button>   
            <button  class="control-button" on:click={() => window.controls.toggleMaximize()}>
                <Icon size={0.8}>
                    {#if maximized}
                        <FaWindowMaximize />
                    {:else}
                        <FaRegWindowMaximize />
                    {/if}
                </Icon>
            </button>
            <button  class="control-button" on:click={() => window.controls.close()}>
                <Icon size={0.9} >
                    <FaTimes />
                </Icon>
            </button>
        </div>
    </div>
    <div class="line">
        <div class="line-inner" style={`width: ${$titleBarStore.barPosition}%`}>
            <RgbLine height="0.3rem" style="border-top-right-radius: 0; transform: rotate(180deg)"/>
        </div>
    </div>
</div>


<style lang="scss">
    .control-button{
        background-color: var(--primary);
        color: var(--primary-text);
        padding: 0.6rem 1rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }
    .control-button:hover{
        background-color: var(--secondary);
    }
    .content{
        display: flex;
        min-height: 1.4rem;
    }
    .controls{
        display: flex;
        flex-direction: row;
        align-items: center;
        -webkit-app-region: no-drag;
        margin-left: auto;
    }
    .line{
        padding-right: 0.4rem;
        overflow: hidden;
        border-top-left-radius: 0.2rem; 
        margin-left: 3.4rem;
    }
    .line-inner{
        width: 100%;
        min-width: 1rem;
        transition: all 0.1s;
    }
    .bar{
        display: flex;
        flex-direction: column;
        -webkit-app-region: drag;
        user-select: none;
        width: 100%;
    }
    .progress {
		height: 4px;
		width: 100%;
		position: absolute;
		z-index: 1000;
		overflow: hidden;
		> div {
			border-radius: 1rem;
			transform: translateX(-110%);
		}
		.progress-70 {
			animation: progressTo70 1s ease-out;
			animation-fill-mode: forwards;
		}
		.progress-finish {
			animation: progressToFinish 0.2s ease-out;
			animation-fill-mode: forwards;
		}
		@keyframes progressTo70 {
			from {
				transform: translateX(-100%);
				opacity: 0.5;
			}
			to {
				opacity: 1;
				transform: translateX(-30%);
			}
		}
		@keyframes progressToFinish {
			from {
				transform: translateX(-30%);
			}
			to {
				transform: translateX(0%);
				opacity: 0.4;
			}
		}
	}
</style>