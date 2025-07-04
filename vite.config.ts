import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	plugins: [svelte()],
	root: 'src',
	build: {
		outDir: '../extension',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				popup: 'src/popup.html',
				// background: "./src/background/index.ts",
				// content: "./src/content/index.ts",
			},
			output: {
				entryFileNames: `assets/[name].js`,
				chunkFileNames: `assets/[name].js`,
				assetFileNames: `assets/[name].[ext]`
			}
		}
	}
});
