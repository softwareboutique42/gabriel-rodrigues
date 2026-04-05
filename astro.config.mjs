// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gabriel-rodrigues.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress Astro internal unused-import warnings (not user code)
          if (
            warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
            warning.exporter?.includes('node_modules/astro')
          ) return;
          warn(warning);
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three';
          },
        },
      },
    },
  },
  integrations: [sitemap()],
});
