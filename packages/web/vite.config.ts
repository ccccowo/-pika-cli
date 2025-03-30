import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['path', 'os'],
      globals: {
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    open: true
  },
  define: {
    'process.env': process.env,
    'global': 'globalThis',
  },
  optimizeDeps: {
    include: ['@pika-cli/create', '@pika-cli/github']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'esnext'
  }
}); 

