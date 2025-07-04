import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),

	svelte: {
		outputDir: 'extension',
	},

	compilerOptions: {
		runes: true,
		compatibility: {
			componentApi: 5
		}
	}
};

export default config;
