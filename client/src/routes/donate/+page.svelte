<script>
	import Icon from '$cmp/layout/Icon.svelte';
	import Title from '$cmp/layout/Title.svelte';
	import FaPaypal from 'svelte-icons/fa/FaPaypal.svelte';
</script>

<div class="page">
	<Title>Donate</Title>

    <div class="content">
        <div>If you like this app, please consider donating to help support the development.</div>
        <div class="links">
            <a class="link" alt="Kofi" href="https://ko-fi.com/specy"> Kofi </a>
            <a class="link" alt="Paypal" href="https://www.paypal.com/paypalme/specydev">
                <Icon>
                    <FaPaypal />
                </Icon>
            </a>
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
		color: var(--accent);
		background-color: var(--secondary);
		border-radius: 0.4rem;
		padding: 0.4rem;
	}
</style>
