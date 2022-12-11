import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path'
/** @type {import('vite').UserConfig} */
const config = {
	server: {
		port: 3123,
	},
	resolve: {
		alias: {
			$cmp: resolve('./src/components/'),
			$sec: resolve('./src/'),
			$stores: resolve('./src/stores/'),
			$utils: resolve('./src/utils/'),
			$common: resolve('../electron/src/common/')
		}
	},
	plugins: [sveltekit()]
};

export default config;
