<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import FaUndoAlt from "svelte-icons/fa/FaUndoAlt.svelte";
	import Button from "./buttons/Button.svelte";
	import Icon from "./layout/Icon.svelte";

    const dispatcher = createEventDispatcher()
    export let isDefault:boolean
    export let title:string


</script>


<div class="title">
    {title}
</div>
<div class="row">
    <slot />
    <Button
        on:click={() => dispatcher("reset")}
        cssVar="primary"
        style="opacity: {isDefault ? 0.2 : 1}; background-color: {isDefault ? "transparent" : "var(--primary);"}"
    >
        <Icon>
            <FaUndoAlt />
        </Icon>
    </Button>
</div>


<style>
    .row{
        display:flex;
        align-items: center;
        gap: 0.6rem;
    }
    .title{
        min-width: 12rem;
    }
</style>