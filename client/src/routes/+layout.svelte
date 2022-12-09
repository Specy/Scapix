<script lang="ts">
	import '../global.css'
	import ErrorLogger from '$cmp/providers/LoggerProvider.svelte'
	import PageTransition from '$cmp/providers/PageTransition.svelte'
	import { page } from '$app/stores'
	import ThemeProvider from '$cmp/providers/ThemeProvider.svelte'
	import PromptProvider from '$cmp/providers/PromptProvider.svelte'
	import Titlebar from '$cmp/layout/Titlebar.svelte';
	import SideMenu from '$cmp/layout/SideMenu.svelte';
	import FaCog from 'svelte-icons/fa/FaCog.svelte'
	import FaDonate from 'svelte-icons/fa/FaDonate.svelte'
	import FaHome from 'svelte-icons/fa/FaHome.svelte'
	import SideMenuOption from '$cmp/layout/SideMenuOption.svelte';
</script>

<ThemeProvider>
	<ErrorLogger>
		<PromptProvider>
			<Titlebar />
			<div class="content">
				<SideMenu>
					<div slot="top" class="links">
						<SideMenuOption to="/">
							<FaHome />
						</SideMenuOption>
						<SideMenuOption to="/donate">
							<FaDonate />
						</SideMenuOption>
					</div>
					<div slot="bottom" class="links">
						<SideMenuOption to="/settings">
							<FaCog />
						</SideMenuOption>
					</div>
				</SideMenu>
				<PageTransition refresh={$page.url.pathname}>
					<slot />
				</PageTransition>
			</div>
		</PromptProvider>
	</ErrorLogger>
</ThemeProvider>

<style lang="scss">
	.content{
		display: flex;
		flex: 1;
	}
	.links{
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
