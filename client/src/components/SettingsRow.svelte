<script lang="ts">
    export let name: string
</script>

<div>
    {name}
</div>
<div class="setting-content">
    <slot />
</div>
<style lang="scss">

    .setting-content{
        flex: 1;
        min-height: 2.4rem;
        display: flex;
    }
</style>