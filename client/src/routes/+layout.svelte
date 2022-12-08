<script lang="ts">
	import '../global.css'
	import ErrorLogger from '$cmp/providers/LoggerProvider.svelte'
	import PageTransition from '$cmp/providers/PageTransition.svelte'
	import { page } from '$app/stores'
	import ThemeProvider from '$cmp/providers/ThemeProvider.svelte'
	import PromptProvider from '$cmp/providers/PromptProvider.svelte'
</script>

<ThemeProvider>
	<ErrorLogger>
		<PromptProvider>
			<PageTransition refresh={$page.url.pathname}>
				<slot />
			</PageTransition>
		</PromptProvider>
	</ErrorLogger>
</ThemeProvider>
