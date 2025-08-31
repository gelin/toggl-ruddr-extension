import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte()],
    root: 'src',
    build: {
        outDir: '../extension',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: 'src/popup.html',
                background: "src/background/background.ts",
                contentLoader: "src/content/contentLoader.js",
                content: "src/content/content.ts",
            },
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
            }
        }
    }
});
