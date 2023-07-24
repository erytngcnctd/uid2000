import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'
import { splitVendorChunkPlugin } from 'vite'

export default defineConfig({
    plugins: [
        {
          apply: 'build',
          enforce: 'post',
        },
      react(),
      splitVendorChunkPlugin(),
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
                buffer: true, 
                global: true,
                process: true,
              },
            })],
        output: {
          manualChunks: {
            web3a: [
              '@web3modal/ethereum',
              '@web3modal/html',
              '@web3modal/react',
              'wagmi',
            ],
            web3b: [ 'web3' ],
            ipfs: ['nft.storage', 'ipfs-http-client' ],
            pdf: ['react-pdf', 'pdfjs-dist'],
            react: [
              'react',
              'react-router-dom',
              'react-dom',
              'react-lazy-load',
              'react-markdown'
            ],
          },
        },
      },
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