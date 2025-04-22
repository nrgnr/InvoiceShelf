import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import laravel from 'laravel-vite-plugin';

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
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
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
                        '@tiptap/extension-text-align',
                        '@tiptap/pm'
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
        vue({
            template: {
                transformAssetUrls: {
                    // The Vue plugin will re-write asset URLs, when referenced
                    // in Single File Components, to point to the Laravel web
                    // server. Setting this to `null` allows the Laravel plugin
                    // to instead re-write asset URLs to point to the Vite
                    // server instead.
                    base: null,

                    // The Vue plugin will parse absolute URLs and treat them
                    // as absolute paths to files on disk. Setting this to
                    // `false` will leave absolute URLs un-touched so they can
                    // reference assets in the public directory as expected.
                    includeAbsolute: false,
                },
            },
        }),
        laravel([
            'resources/scripts/main.js'
        ])
    ]
});
