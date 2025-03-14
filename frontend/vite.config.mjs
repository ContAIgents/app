import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import mdx from '@mdx-js/rollup';

export default defineConfig({
  plugins: [
    mdx(),
    react(),
    tsconfigPaths()
  ],
  define: {
    'process.env.USE_DUMMY_LLM': JSON.stringify(process.env.USE_DUMMY_LLM === 'true'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
});
