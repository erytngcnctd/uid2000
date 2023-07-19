import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'

export default defineConfig({
    plugins: [
        {
          apply: 'build',
          enforce: 'post',
        },
      react(),
    ],
    define: {
      global: 'globalThis',
    },
    server: {
      host: true,
      port: 3000,
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        plugins: [rollupNodePolyFill({
            globals: {
                Buffer: true, 
                global: true,
                process: true,
              },
            })],
      }
    },
    optimizeDeps: {
      commonjsOptions: {
        transformMixedEsModules: true,
      }
    },
    resolve: {
      alias: {
        'readable-stream': 'vite-compatible-readable-stream',
        stream: 'vite-compatible-readable-stream',
        path: require.resolve('path-browserify'),
        util: 'rollup-plugin-node-polyfills/polyfills/util',
        buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
        process: 'rollup-plugin-node-polyfills/polyfills/process-es6'    
     },
    },
  }) 