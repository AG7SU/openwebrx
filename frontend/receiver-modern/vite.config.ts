import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';

const outputDirectory = fileURLToPath(new URL('../../htdocs/modern/', import.meta.url));

export default defineConfig({
    plugins: [svelte()],
    build: {
        outDir: outputDirectory,
        emptyOutDir: true,
        sourcemap: false,
        lib: {
            entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
            formats: ['es'],
            fileName: () => 'receiver-ui.js',
            cssFileName: 'receiver-ui'
        }
    }
});
