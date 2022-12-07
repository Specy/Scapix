import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	server: {
		port: 3123,
	},
	plugins: [sveltekit()]
};

export default config;
