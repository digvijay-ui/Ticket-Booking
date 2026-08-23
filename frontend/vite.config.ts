import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const hmrClientPort = Number(process.env.VITE_HMR_CLIENT_PORT || process.env.PORT || 5173);
const hmrHost = process.env.VITE_HMR_HOST || 'localhost';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: hmrHost,
      clientPort: hmrClientPort,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
