import type { Api, Controls } from '../../electron/src/client/ipc/api'

/// <reference types="../../electron" />
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}


export declare global {
	interface Window {
		api: Api
		controls: Controls
	}
}