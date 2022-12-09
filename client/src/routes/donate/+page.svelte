<script>
	import Icon from '$cmp/layout/Icon.svelte';
	import Title from '$cmp/layout/Title.svelte';
	import KoFi from '$cmp/misc/KoFi.svelte';
	import FaPaypal from 'svelte-icons/fa/FaPaypal.svelte';
</script>

<div class="page">
	<Title>Donate</Title>

    <div class="content">
        <div>If you like this app, please consider donating to help support the development.</div>
        <div class="links">
            <button class="link" alt="Kofi" on:click={() => window.api.gotoExternal("https://ko-fi.com/specy ")}>
				<Icon size={3}>
					<KoFi />
				</Icon>
			</button>
            <button class="link" alt="Paypal" on:click={() => window.api.gotoExternal("https://www.paypal.com/paypalme/specydev")}>
                <Icon size={3}>
                    <FaPaypal />
                </Icon>
            </button>
        </div>
    </div>

</div>

<style lang="scss">
    .content{
        padding: 0  1rem;
    }
	.links {
		display: flex;
		flex-direction: row;
		gap: 2rem;
        margin-top: 1rem;
        padding: 1rem;
	}
	.page {
		padding: 1rem;
	}
	.link {
		border: none;
		color: var(--accent);
		background-color: var(--secondary);
		border-radius: 0.4rem;
		padding: 0.6rem 1rem;
	}
</style>
