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
	import FaInfo from 'svelte-icons/fa/FaInfo.svelte'

	import SideMenuOption from '$cmp/layout/SideMenuOption.svelte';
	import { onMount } from 'svelte';
	import { Status } from '$common/types/Files';
	import type { ConversionFile } from '$stores/conversionStore';
	import { conversionsStore } from '$stores/conversionStore'
	import { titleBarStore } from '$stores/titleBarStore';
	let maximized = false;
	onMount(() => {
		const idMaximization = window.controls.addOnMaximizationChange((isMaximized) => {
			maximized = isMaximized;
		})
		const idStatusChange = window.api.onProcessStatusChange((file, status) => {
			conversionsStore.updateStatus(file.id, status)
		})
		return () => {
			window.controls.removeOnMaximizationChange(idMaximization)
			window.api.removeOnProcessStatusChange(idStatusChange)
		}
	})
	function calculateProgress(files: ConversionFile[]){
		let toConvert = 0
		let finished = 0
		for(const file of files){
			const status = file.status.status
			if(status === Status.Done || status === Status.Error){
				finished++
			}else if(status === Status.Converting || status === Status.Waiting){
				toConvert++
				if(status === Status.Converting){
					const done = file.status.currentFrame ?? 0
					finished += done
					toConvert += (file.status.totalFrames ?? 0) - done
				}
			}
		}
		try{
			return Math.round((finished / (finished + toConvert)) * 100)
		}catch(e){
			return 0
		}
	}
	$:{
		titleBarStore.setBarPosition(calculateProgress($conversionsStore.files))
	}
</script>

<div 
	class="root"
	class:maximized
>
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
							<SideMenuOption to="/info">
								<FaInfo />
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
</div>

<style lang="scss">
	.content{
		display: flex;
		height: 100%;
		overflow: hidden;
	}
	.links{
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.root{
		background-color: var(--primary);
		color: var(--primary-text);
		border-radius: 0.6rem;
		display: flex;
		flex: 1;
		flex-direction: column;
		overflow: hidden;
	}
	.maximized{
		border-radius: 0;
	}
</style>
