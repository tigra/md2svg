import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for production build - will be placed under /md2svg/
  base: '/md2svg/',

  // Development server config
  server: {
    port: 3000,
    open: true,
  },

  // Build options
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Preserve comments in production build
    minify: {
      format: {
        comments: true,
      },
    },
    // Ensure Vite knows about the public assets
    assetsInlineLimit: 0,  // Don't inline any assets as base64
    rollupOptions: {
      output: {
        // Output format configuration to ensure proper paths
        manualChunks: undefined,
      },
    },
  },

  // Public directory where non-imported files should be placed
  publicDir: 'public',
});