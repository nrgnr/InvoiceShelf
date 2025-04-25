import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import laravel from 'laravel-vite-plugin';
import tiptapPmPatch from './.vite/patches/@tiptap-pm.patch.js';

export default defineConfig({
    resolve: {
        alias: {
            "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js",
            '@': resolve(__dirname, './resources/'),
            $fonts: resolve(__dirname, './resources/static/fonts'),
            $images: resolve(__dirname, './resources/static/img'),
            
            // TipTap PM resolution fix - redirect to our proxy
            '@tiptap/pm': resolve(__dirname, './tiptap-pm-proxy.js'),
            
            // Also add specific submodule redirects
            '@tiptap/pm/model': resolve(__dirname, 'node_modules/@tiptap/pm/dist/model.js'),
            '@tiptap/pm/state': resolve(__dirname, 'node_modules/@tiptap/pm/dist/state.js'),
            '@tiptap/pm/view': resolve(__dirname, 'node_modules/@tiptap/pm/dist/view.js'),
            '@tiptap/pm/transform': resolve(__dirname, 'node_modules/@tiptap/pm/dist/transform.js'),
            '@tiptap/pm/commands': resolve(__dirname, 'node_modules/@tiptap/pm/dist/commands.js'),
            '@tiptap/pm/keymap': resolve(__dirname, 'node_modules/@tiptap/pm/dist/keymap.js'),
            '@tiptap/pm/schema-list': resolve(__dirname, 'node_modules/@tiptap/pm/dist/schema-list.js'),
            '@tiptap/pm/schema-basic': resolve(__dirname, 'node_modules/@tiptap/pm/dist/schema-basic.js')
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'],
        dedupe: ['vue']
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                // Global replacements
                global: 'globalThis'
            }
        },
        exclude: ['@tiptap/pm']  // Don't pre-bundle this
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            external: [], // Don't treat any imports as external
            output: {
                manualChunks: {
                    'vendor': [
                        'vue',
                        'vue-router',
                        'pinia',
                        '@headlessui/vue',
                        '@heroicons/vue',
                        '@tiptap/core',
                        '@tiptap/starter-kit',
                        '@tiptap/vue-3',
                        'axios',
                        'chart.js',
                        'moment',
                        'vue-i18n'
                    ],
                    'editor': [
                        '@tiptap/extension-link',
                        '@tiptap/extension-text-align'
                    ],
                    'forms': [
                        '@vuelidate/core',
                        '@vuelidate/validators',
                        '@vuelidate/components',
                        'v-money3',
                        'vue-flatpickr-component'
                    ]
                }
            }
        },
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    plugins: [
        tiptapPmPatch(),
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
