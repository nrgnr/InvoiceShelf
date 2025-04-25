import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import laravel from 'laravel-vite-plugin';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
    resolve: {
        alias: {
            "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js",
            '@': resolve(__dirname, './resources/'),
            $fonts: resolve(__dirname, './resources/static/fonts'),
            $images: resolve(__dirname, './resources/static/img'),
            '@tiptap/pm': resolve(__dirname, './pm-workaround/index.js')
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'],
        dedupe: ['vue']
    },
    define: {
        'process.env': {}
    },
    optimizeDeps: {
        include: ['@tiptap/pm']
    },
    build: {
        chunkSizeWarningLimit: 1000,
        sourcemap: false,
        commonjsOptions: {
            include: [/node_modules\/@tiptap\/pm/]
        }
    },
    plugins: [
        commonjs(),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        laravel([
            'resources/scripts/main.js'
        ])
    ]
});
