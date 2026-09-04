import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Freelancer.com's registered local redirect URI is
      // http://localhost:5173/auth, but the OAuth callback must be handled by
      // the backend — the token exchange needs the client secret, which must
      // never reach the browser. Proxy the callback through to school_b.
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: false,
      },
    },
  },
});
