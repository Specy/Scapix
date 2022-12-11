<script>
	import Button from "$cmp/buttons/Button.svelte";
	import NumberInput from "$cmp/inputs/NumberInput.svelte";
	import Title from "$cmp/layout/Title.svelte";
	import SettingsRow from "$cmp/SettingsRow.svelte";
	import { settingsStore } from "$stores/settingsStore";
</script>

<div class="page">
	<Title noMargin>
		Settings
	</Title>
	<div class="proprieties">
		<SettingsRow name={$settingsStore.maxConcurrentFrames.name}>
			<NumberInput 
				min={1}
				bind:value={$settingsStore.maxConcurrentFrames.value} 
			/>
		</SettingsRow>
		<SettingsRow name={$settingsStore.maxConcurrentOperations.name}>
			<NumberInput 
				min={1}
				bind:value={$settingsStore.maxConcurrentOperations.value} 
			/>
		</SettingsRow>
		<SettingsRow name={$settingsStore.outputDirectory.name}>
			<div style="display: flex; flex-direction:column; gap: 0.4rem; flex: 1">

				<Button cssVar="accent" on:click={async () => {
					const result = await window.api.askDirectory()
					if(result){
						$settingsStore.outputDirectory.value = result
					}
				}}>
					Set folder
				</Button>

				<div class='ellipsis' style="width: 50%;">
					{$settingsStore.outputDirectory.value || "Using default"}
				</div>
			</div>
		</SettingsRow>
	</div>
</div>

<style>
	.page{
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 2rem;
		gap: 1rem;
	}
	.ellipsis{
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.proprieties{
		display: grid;
		padding-left: 1rem;
		align-items: center;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
</style>
