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
            $images: resolve(__dirname, './resources/static/img')
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs']
    },
    build: {
        commonjsOptions: {
            // Fix for commonjs modules
            transformMixedEsModules: true
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': [
                        'vue',
                        'vue-router',
                        'pinia',
                        '@headlessui/vue',
                        '@heroicons/vue',
                        'axios',
                        'chart.js',
                        'moment',
                        'vue-i18n'
                    ],
                    'editor': [
                        '@tiptap/core',
                        '@tiptap/starter-kit',
                        '@tiptap/vue-3',
                        '@tiptap/extension-link',
                        '@tiptap/extension-text-align'
                        // @tiptap/pm is handled by our patch
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
        }
    },
    plugins: [
        // TipTap PM patch to fix module resolution
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
