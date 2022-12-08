<script>
	import { onMount } from "svelte";


    let a = 0

    onMount(async () => {
        console.log(await window.api.ping())
    })

</script>

<button on:click={() => a++}>
    Test
</button>
{a}

<style>
    button {
        color: red;
    }
</style>