<script lang="ts">
	export let value = ''
	export let style = ''
    import FaChevronDown from 'svelte-icons/fa/FaChevronDown.svelte'
</script>

<div class="wrapper" {style}>
    <select 
        on:change
        bind:value
        
    >
        <slot />
    </select>
    <div class="chevron">
        <FaChevronDown />
    </div>
</div>


<style lang="scss">
	select {
		display: flex;
		align-items: center;
		padding: 0.2rem;
        flex: 1;
		color: var(--tertiary-text);
        background-color: var(--tertiary);
		border-radius: 0.4rem;  
		padding: 0.6rem 0.8rem;
        appearance: none;
	}
    option {
        line-height: 2rem;
    }
    .chevron{
        display: flex;
        top: 0;
        right: 0.8rem;
        width: 0.6rem;
        align-items: center;
        position: absolute;
        height: 100%;
        pointer-events: none;
    }
    .wrapper{
        display: flex;
        position: relative;
    }
</style>
